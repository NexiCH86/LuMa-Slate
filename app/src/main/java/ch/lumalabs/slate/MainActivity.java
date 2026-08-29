package ch.lumalabs.slate;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends Activity {
    private static final String SHELL_VERSION = "1.0.0";
    private static final String BUNDLED_UI_VERSION = "0.6.0";
    private static final String BASE_URL = "https://raw.githubusercontent.com/NexiCH86/LuMa-Slate/main/";
    private static final List<String> UI_FILES = Arrays.asList(
            "index.html", "styles.css", "app.js", "manifest.webmanifest", "update-manifest.json"
    );

    private WebView webView;
    private File uiDir;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        getWindow().setStatusBarColor(Color.rgb(8, 47, 50));
        getWindow().setNavigationBarColor(Color.rgb(246, 247, 245));

        uiDir = new File(getFilesDir(), "luma-ui");
        if (!uiDir.exists()) uiDir.mkdirs();
        ensureBundledUi();

        webView = new WebView(this);
        setContentView(webView);
        configureWebView();
        loadLocalUi();
        checkForUiUpdate(false);
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        webView.setBackgroundColor(Color.rgb(246, 247, 245));
        webView.addJavascriptInterface(new NativeBridge(), "LuMaNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("file".equalsIgnoreCase(scheme)) return false;
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                return false;
            }
        });
    }

    private void ensureBundledUi() {
        File index = new File(uiDir, "index.html");
        String current = getPreferences(MODE_PRIVATE).getString("uiVersion", null);
        if (index.exists() && current != null) return;
        for (String name : UI_FILES) copyAsset(name, new File(uiDir, name));
        getPreferences(MODE_PRIVATE).edit().putString("uiVersion", BUNDLED_UI_VERSION).apply();
    }

    private void copyAsset(String name, File target) {
        try (InputStream in = getAssets().open(name);
             BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(target))) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
        } catch (Exception ignored) { }
    }

    private void loadLocalUi() {
        File index = new File(uiDir, "index.html");
        webView.loadUrl(Uri.fromFile(index).toString() + "?shell=" + SHELL_VERSION + "&v=" + getUiVersion());
    }

    private String getUiVersion() {
        return getPreferences(MODE_PRIVATE).getString("uiVersion", BUNDLED_UI_VERSION);
    }

    private void checkForUiUpdate(boolean manual) {
        new Thread(() -> {
            try {
                String manifestText = readUrl(BASE_URL + "update-manifest.json?ts=" + System.currentTimeMillis());
                JSONObject manifest = new JSONObject(manifestText);
                String latest = manifest.getString("latestUiVersion");
                String minShell = manifest.optString("minimumShellVersion", "1.0.0");
                if (compareVersions(SHELL_VERSION, minShell) < 0) return;
                if (compareVersions(latest, getUiVersion()) <= 0) return;

                File staging = new File(getFilesDir(), "luma-ui-staging");
                deleteRecursive(staging);
                staging.mkdirs();
                for (String name : UI_FILES) downloadFile(BASE_URL + name + "?ts=" + System.currentTimeMillis(), new File(staging, name));

                File old = new File(getFilesDir(), "luma-ui-old");
                deleteRecursive(old);
                if (uiDir.exists()) uiDir.renameTo(old);
                staging.renameTo(uiDir);
                deleteRecursive(old);
                getPreferences(MODE_PRIVATE).edit().putString("uiVersion", latest).apply();
                runOnUiThread(this::loadLocalUi);
            } catch (Exception ignored) {
                if (manual) runOnUiThread(() -> webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('luma-update-error'))", null));
            }
        }).start();
    }

    private String readUrl(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(7000);
        c.setReadTimeout(10000);
        c.setRequestProperty("User-Agent", "LuMa-Slate/" + SHELL_VERSION);
        try (InputStream in = new BufferedInputStream(c.getInputStream())) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } finally {
            c.disconnect();
        }
    }

    private void downloadFile(String url, File target) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(7000);
        c.setReadTimeout(15000);
        c.setRequestProperty("User-Agent", "LuMa-Slate/" + SHELL_VERSION);
        try (InputStream in = new BufferedInputStream(c.getInputStream());
             BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(target))) {
            byte[] buffer = new byte[16384];
            int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
        } finally {
            c.disconnect();
        }
    }

    private int compareVersions(String a, String b) {
        String[] aa = a.split("\\.");
        String[] bb = b.split("\\.");
        int n = Math.max(aa.length, bb.length);
        for (int i = 0; i < n; i++) {
            int av = i < aa.length ? parseInt(aa[i]) : 0;
            int bv = i < bb.length ? parseInt(bb[i]) : 0;
            if (av != bv) return Integer.compare(av, bv);
        }
        return 0;
    }

    private int parseInt(String s) {
        try { return Integer.parseInt(s.replaceAll("[^0-9].*$", "")); }
        catch (Exception e) { return 0; }
    }

    private void deleteRecursive(File f) {
        if (f == null || !f.exists()) return;
        if (f.isDirectory()) {
            File[] children = f.listFiles();
            if (children != null) for (File child : children) deleteRecursive(child);
        }
        f.delete();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    public class NativeBridge {
        @JavascriptInterface public String getShellVersion() { return SHELL_VERSION; }
        @JavascriptInterface public String getUiVersion() { return MainActivity.this.getUiVersion(); }
        @JavascriptInterface public void checkForUpdates() { MainActivity.this.checkForUiUpdate(true); }
        @JavascriptInterface public void reload() { runOnUiThread(MainActivity.this::loadLocalUi); }
    }
}
