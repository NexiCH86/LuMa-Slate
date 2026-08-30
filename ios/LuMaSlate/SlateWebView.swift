import SwiftUI
import WebKit
import UIKit
import UniformTypeIdentifiers

struct SlateWebView: UIViewRepresentable {
    private let shellVersion = "1.0.0-ios"
    private let sourceBase = URL(string: "https://raw.githubusercontent.com/NexiCH86/LuMa-Slate/main/")!
    private let uiFiles = ["index.html", "styles.css", "app.js", "features-v010.js", "manifest.webmanifest", "update-manifest.json"]

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let controller = WKUserContentController()
        controller.add(context.coordinator, name: "luma")
        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.websiteDataStore = .default()

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 244/255, green: 246/255, blue: 248/255, alpha: 1)
        context.coordinator.webView = webView
        context.coordinator.prepareAndLoad()
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler, UIDocumentPickerDelegate {
        let parent: SlateWebView
        weak var webView: WKWebView?
        private var uiDirectory: URL {
            let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            return base.appendingPathComponent("LuMaSlate/UI", isDirectory: true)
        }

        init(_ parent: SlateWebView) { self.parent = parent }

        func prepareAndLoad() {
            try? FileManager.default.createDirectory(at: uiDirectory, withIntermediateDirectories: true)
            installBundledUIIfNeeded()
            loadLocalUI()
            Task { await checkForUpdates(manual: false) }
        }

        private func installBundledUIIfNeeded() {
            let index = uiDirectory.appendingPathComponent("index.html")
            guard !FileManager.default.fileExists(atPath: index.path) else { return }
            guard let bundled = Bundle.main.resourceURL?.appendingPathComponent("SlateUI", isDirectory: true) else { return }
            for name in parent.uiFiles {
                let source = bundled.appendingPathComponent(name)
                let target = uiDirectory.appendingPathComponent(name)
                if FileManager.default.fileExists(atPath: source.path) {
                    try? FileManager.default.copyItem(at: source, to: target)
                }
            }
            UserDefaults.standard.set("0.10.0", forKey: "luma.uiVersion")
        }

        private func loadLocalUI() {
            guard let webView else { return }
            let index = uiDirectory.appendingPathComponent("index.html")
            let version = UserDefaults.standard.string(forKey: "luma.uiVersion") ?? "0.10.0"
            guard FileManager.default.fileExists(atPath: index.path) else { return }
            var components = URLComponents(url: index, resolvingAgainstBaseURL: false)
            components?.queryItems = [URLQueryItem(name: "shell", value: parent.shellVersion), URLQueryItem(name: "v", value: version)]
            webView.loadFileURL(components?.url ?? index, allowingReadAccessTo: uiDirectory)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            UIDevice.current.isBatteryMonitoringEnabled = true
            let battery = UIDevice.current.batteryLevel >= 0 ? Int(UIDevice.current.batteryLevel * 100) : -1
            let info: [String: Any] = [
                "batteryPercent": battery,
                "charging": UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full,
                "networkConnected": true,
                "networkType": "iPadOS",
                "deviceModel": "Apple iPad",
                "iosVersion": UIDevice.current.systemVersion
            ]
            let version = UserDefaults.standard.string(forKey: "luma.uiVersion") ?? "0.10.0"
            let infoData = (try? JSONSerialization.data(withJSONObject: info)) ?? Data("{}".utf8)
            let infoJSON = String(data: infoData, encoding: .utf8) ?? "{}"
            let escapedInfo = infoJSON.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "'", with: "\\'")
            let bridge = """
            window.LuMaNative = window.LuMaNative || {};
            window.LuMaNative.getShellVersion = function(){ return '\(parent.shellVersion)'; };
            window.LuMaNative.getUiVersion = function(){ return '\(version)'; };
            window.LuMaNative.getSystemInfo = function(){ return '\(escapedInfo)'; };
            window.LuMaNative.getUpdateStatus = function(){ return JSON.stringify({status:'ready',channel:'stable',uiVersion:'\(version)',shellVersion:'\(parent.shellVersion)'}); };
            window.LuMaNative.checkForUpdates = function(){ window.webkit.messageHandlers.luma.postMessage({action:'checkForUpdates'}); };
            window.LuMaNative.pickDocument = function(){ window.webkit.messageHandlers.luma.postMessage({action:'pickDocument'}); };
            window.LuMaNative.openExternalUrl = function(url){ window.webkit.messageHandlers.luma.postMessage({action:'openExternal',url:url}); };
            window.LuMaNative.reload = function(){ window.webkit.messageHandlers.luma.postMessage({action:'reload'}); };
            window.LuMaNative.getPdfInfo = function(){ return JSON.stringify({error:'ios_bridge_pending'}); };
            window.LuMaNative.renderPdfPage = function(){ return JSON.stringify({error:'ios_bridge_pending'}); };
            window.dispatchEvent(new CustomEvent('luma-platform-ready',{detail:{platform:'ipados',shellVersion:'\(parent.shellVersion)'}}));
            """
            webView.evaluateJavaScript(bridge)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
            switch action {
            case "checkForUpdates": Task { await checkForUpdates(manual: true) }
            case "pickDocument": presentDocumentPicker()
            case "openExternal":
                if let raw = body["url"] as? String, let url = URL(string: raw) { UIApplication.shared.open(url) }
            case "reload": loadLocalUI()
            default: break
            }
        }

        private func presentDocumentPicker() {
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.pdf, .plainText, .epub, .data], asCopy: true)
            picker.delegate = self
            topViewController()?.present(picker, animated: true)
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            guard let url = urls.first else { return }
            let detail: [String: Any] = ["uri": url.absoluteString, "name": url.lastPathComponent, "mime": "application/octet-stream"]
            Task { @MainActor in emitEvent("luma-file-selected", detail: detail) }
        }

        private func topViewController() -> UIViewController? {
            guard let scene = UIApplication.shared.connectedScenes.compactMap({ $0 as? UIWindowScene }).first,
                  let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else { return nil }
            var top = root
            while let presented = top.presentedViewController { top = presented }
            return top
        }

        @MainActor private func emitEvent(_ name: String, detail: [String: Any]) {
            guard let data = try? JSONSerialization.data(withJSONObject: detail), let json = String(data: data, encoding: .utf8) else { return }
            webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('\(name)',{detail:\(json)}));")
        }

        private func checkForUpdates(manual: Bool) async {
            do {
                let manifestURL = parent.sourceBase.appendingPathComponent("update-manifest.json")
                let (manifestData, _) = try await URLSession.shared.data(from: manifestURL)
                guard let manifest = try JSONSerialization.jsonObject(with: manifestData) as? [String: Any],
                      let latest = manifest["latestUiVersion"] as? String else { return }
                let current = UserDefaults.standard.string(forKey: "luma.uiVersion") ?? "0.10.0"
                guard latest.compare(current, options: .numeric) == .orderedDescending else {
                    if manual { await emitEvent("luma-update-status", detail: ["status":"up_to_date","latestUiVersion":latest]) }
                    return
                }
                let staging = uiDirectory.deletingLastPathComponent().appendingPathComponent("UI-staging", isDirectory: true)
                try? FileManager.default.removeItem(at: staging)
                try FileManager.default.createDirectory(at: staging, withIntermediateDirectories: true)
                for name in parent.uiFiles {
                    let (data, _) = try await URLSession.shared.data(from: parent.sourceBase.appendingPathComponent(name))
                    try data.write(to: staging.appendingPathComponent(name), options: .atomic)
                }
                try? FileManager.default.removeItem(at: uiDirectory)
                try FileManager.default.moveItem(at: staging, to: uiDirectory)
                UserDefaults.standard.set(latest, forKey: "luma.uiVersion")
                await MainActor.run { self.loadLocalUI() }
            } catch {
                if manual { await emitEvent("luma-update-error", detail: ["status":"error","message":error.localizedDescription]) }
            }
        }
    }
}
