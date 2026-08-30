import SwiftUI

@main
struct LuMaSlateApp: App {
    var body: some Scene {
        WindowGroup {
            SlateWebView()
                .ignoresSafeArea()
        }
    }
}
