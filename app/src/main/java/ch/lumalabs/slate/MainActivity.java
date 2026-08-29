package ch.lumalabs.slate;

import android.app.Activity;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ActivityInfo;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.pdf.PdfRenderer;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.os.StatFs;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends Activity {
    private static final String SHELL_VERSION = "1.1.0";
    private static final String BUNDLED_UI_VERSION = "0.10.0";
    private static final String BASE_URL = "https://raw.githubusercontent.com/NexiCH86/LuMa-Slate/main/";
    private static final int REQUEST_OPEN_DOCUMENT = 2048;
    private static final List<String> UI_FILES = Arrays.asList(
            "index.html", "styles.css", "app.js", "features-v010.js", "manifest.webmanifest", "update-manifest.json"
    );

    private WebView webView;
    private File uiDir;
    private volatile String updateStatus = "idle";
    private volatile long lastUpdateCheck = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        getWindow().setStatusBarColor(Color.rgb(7, 17, 23));
        getWindow().setNavigationBarColor(Color.rgb(244, 246, 248));
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
        webView.setBackgroundColor(Color.rgb(244, 246, 248));
        webView.addJavascriptInterface(new NativeBridge(), "LuMaNative");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("file".equalsIgnoreCase(scheme) || "content".equalsIgnoreCase(scheme)) return false;
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    openExternal(uri.toString());
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                File feature = new File(uiDir, "features-v010.js");
                if (!feature.exists()) return;
                String src = Uri.fromFile(feature).toString();
                String js = "(function(){if(document.getElementById('luma-v010-script'))return;var s=document.createElement('script');s.id='luma-v010-script';s.src=" + JSONObject.quote(src) + ";document.body.appendChild(s);})();";
                view.evaluateJavascript(js, null);
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

    private void emitEvent(String name, JSONObject detail) {
        if (webView == null) return;
        String payload = detail == null ? "{}" : detail.toString();
        String js = "window.dispatchEvent(new CustomEvent(" + JSONObject.quote(name) + ",{detail:JSON.parse(" + JSONObject.quote(payload) + ")}));";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private void checkForUiUpdate(boolean manual) {
        updateStatus = "checking";
        lastUpdateCheck = System.currentTimeMillis();
        new Thread(() -> {
            try {
                String manifestText = readUrl(BASE_URL + "update-manifest.json?ts=" + System.currentTimeMillis());
                JSONObject manifest = new JSONObject(manifestText);
                String latest = manifest.getString("latestUiVersion");
                String minShell = manifest.optString("minimumShellVersion", "1.0.0");
                if (compareVersions(SHELL_VERSION, minShell) < 0) {
                    updateStatus = "shell_required";
                    JSONObject d = new JSONObject();
                    d.put("status", updateStatus);
                    d.put("minimumShellVersion", minShell);
                    emitEvent("luma-update-status", d);
                    return;
                }
                if (compareVersions(latest, getUiVersion()) <= 0) {
                    updateStatus = "up_to_date";
                    JSONObject d = new JSONObject();
                    d.put("status", updateStatus);
                    d.put("latestUiVersion", latest);
                    emitEvent("luma-update-status", d);
                    return;
                }
                updateStatus = "downloading";
                File staging = new File(getFilesDir(), "luma-ui-staging");
                deleteRecursive(staging);
                staging.mkdirs();
                for (String name : UI_FILES) downloadFile(BASE_URL + name + "?ts=" + System.currentTimeMillis(), new File(staging, name));
                File old = new File(getFilesDir(), "luma-ui-old");
                deleteRecursive(old);
                if (uiDir.exists()) uiDir.renameTo(old);
                if (!staging.renameTo(uiDir)) throw new IllegalStateException("UI update swap failed");
                deleteRecursive(old);
                getPreferences(MODE_PRIVATE).edit().putString("uiVersion", latest).apply();
                updateStatus = "updated";
                runOnUiThread(this::loadLocalUi);
            } catch (Exception e) {
                updateStatus = "error";
                if (manual) {
                    JSONObject d = new JSONObject();
                    try { d.put("status", updateStatus); d.put("message", e.getClass().getSimpleName()); } catch (Exception ignored) { }
                    emitEvent("luma-update-error", d);
                }
            }
        }).start();
    }

    private String readUrl(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(7000);
        c.setReadTimeout(10000);
        c.setRequestProperty("User-Agent", "LuMa-Slate/" + SHELL_VERSION);
        try (InputStream in = new BufferedInputStream(c.getInputStream()); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } finally { c.disconnect(); }
    }

    private void downloadFile(String url, File target) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(7000);
        c.setReadTimeout(15000);
        c.setRequestProperty("User-Agent", "LuMa-Slate/" + SHELL_VERSION);
        try (InputStream in = new BufferedInputStream(c.getInputStream()); BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(target))) {
            byte[] buffer = new byte[16384]; int read;
            while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
        } finally { c.disconnect(); }
    }

    private int compareVersions(String a, String b) {
        String[] aa = a.split("\\."); String[] bb = b.split("\\.");
        int n = Math.max(aa.length, bb.length);
        for (int i = 0; i < n; i++) {
            int av = i < aa.length ? parseInt(aa[i]) : 0; int bv = i < bb.length ? parseInt(bb[i]) : 0;
            if (av != bv) return Integer.compare(av, bv);
        }
        return 0;
    }

    private int parseInt(String s) {
        try { return Integer.parseInt(s.replaceAll("[^0-9].*$", "")); } catch (Exception e) { return 0; }
    }

    private void deleteRecursive(File f) {
        if (f == null || !f.exists()) return;
        if (f.isDirectory()) { File[] children = f.listFiles(); if (children != null) for (File child : children) deleteRecursive(child); }
        f.delete();
    }

    private JSONObject systemInfo() {
        JSONObject o = new JSONObject();
        try {
            Intent battery = registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
            int level = battery != null ? battery.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) : -1;
            int scale = battery != null ? battery.getIntExtra(BatteryManager.EXTRA_SCALE, 100) : 100;
            int pct = level >= 0 && scale > 0 ? Math.round(level * 100f / scale) : -1;
            int plugged = battery != null ? battery.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0) : 0;
            o.put("batteryPercent", pct); o.put("charging", plugged != 0);
            StatFs stat = new StatFs(getFilesDir().getAbsolutePath());
            o.put("storageFreeBytes", stat.getAvailableBytes()); o.put("storageTotalBytes", stat.getTotalBytes());
            ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            Network network = cm != null ? cm.getActiveNetwork() : null;
            NetworkCapabilities caps = network != null && cm != null ? cm.getNetworkCapabilities(network) : null;
            boolean connected = caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
            String type = "Offline";
            if (caps != null) {
                if (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) type = "Wi‑Fi";
                else if (caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) type = "Mobile";
                else if (caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) type = "Ethernet";
                else if (connected) type = "Online";
            }
            o.put("networkConnected", connected); o.put("networkType", type);
            o.put("androidVersion", android.os.Build.VERSION.RELEASE);
            o.put("deviceModel", android.os.Build.MANUFACTURER + " " + android.os.Build.MODEL);
        } catch (Exception ignored) { }
        return o;
    }

    private JSONObject updateInfo() {
        JSONObject o = new JSONObject();
        try {
            o.put("status", updateStatus); o.put("lastCheck", lastUpdateCheck); o.put("source", BASE_URL);
            o.put("channel", "stable"); o.put("uiVersion", getUiVersion()); o.put("shellVersion", SHELL_VERSION);
        } catch (Exception ignored) { }
        return o;
    }

    private void openDocumentPicker() {
        runOnUiThread(() -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("*/*");
            intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/pdf", "application/epub+zip", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
            startActivityForResult(intent, REQUEST_OPEN_DOCUMENT);
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_OPEN_DOCUMENT || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        try {
            int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            getContentResolver().takePersistableUriPermission(uri, flags & Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } catch (Exception ignored) { }
        JSONObject detail = new JSONObject();
        try {
            detail.put("uri", uri.toString()); detail.put("mime", getContentResolver().getType(uri));
            try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME); int sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);
                    if (nameIndex >= 0) detail.put("name", cursor.getString(nameIndex));
                    if (sizeIndex >= 0 && !cursor.isNull(sizeIndex)) detail.put("size", cursor.getLong(sizeIndex));
                }
            }
        } catch (Exception ignored) { }
        emitEvent("luma-file-selected", detail);
    }

    private JSONObject pdfInfo(String uriString) {
        JSONObject out = new JSONObject();
        try (ParcelFileDescriptor pfd = getContentResolver().openFileDescriptor(Uri.parse(uriString), "r");
             PdfRenderer renderer = pfd != null ? new PdfRenderer(pfd) : null) {
            if (renderer == null) throw new IllegalStateException("PDF unavailable");
            out.put("pageCount", renderer.getPageCount());
        } catch (Exception e) {
            try { out.put("error", e.getClass().getSimpleName()); } catch (Exception ignored) { }
        }
        return out;
    }

    private JSONObject renderPdfPage(String uriString, int pageIndex, int maxWidth) {
        JSONObject out = new JSONObject();
        try (ParcelFileDescriptor pfd = getContentResolver().openFileDescriptor(Uri.parse(uriString), "r");
             PdfRenderer renderer = pfd != null ? new PdfRenderer(pfd) : null) {
            if (renderer == null) throw new IllegalStateException("PDF unavailable");
            int index = Math.max(0, Math.min(pageIndex, renderer.getPageCount() - 1));
            try (PdfRenderer.Page page = renderer.openPage(index)) {
                int targetWidth = Math.max(600, Math.min(maxWidth > 0 ? maxWidth : 1400, 1800));
                int targetHeight = Math.max(1, Math.round(targetWidth * (page.getHeight() / (float) page.getWidth())));
                Bitmap bitmap = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.ARGB_8888);
                bitmap.eraseColor(Color.WHITE);
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.PNG, 92, bytes);
                bitmap.recycle();
                out.put("pageIndex", index); out.put("pageCount", renderer.getPageCount());
                out.put("width", targetWidth); out.put("height", targetHeight);
                out.put("base64", Base64.encodeToString(bytes.toByteArray(), Base64.NO_WRAP));
            }
        } catch (Exception e) {
            try { out.put("error", e.getClass().getSimpleName()); } catch (Exception ignored) { }
        }
        return out;
    }

    private void openExternal(String url) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) { }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    public class NativeBridge {
        @JavascriptInterface public String getShellVersion() { return SHELL_VERSION; }
        @JavascriptInterface public String getUiVersion() { return MainActivity.this.getUiVersion(); }
        @JavascriptInterface public String getSystemInfo() { return MainActivity.this.systemInfo().toString(); }
        @JavascriptInterface public String getUpdateStatus() { return MainActivity.this.updateInfo().toString(); }
        @JavascriptInterface public void checkForUpdates() { MainActivity.this.checkForUiUpdate(true); }
        @JavascriptInterface public void pickDocument() { MainActivity.this.openDocumentPicker(); }
        @JavascriptInterface public String getPdfInfo(String uri) { return MainActivity.this.pdfInfo(uri).toString(); }
        @JavascriptInterface public String renderPdfPage(String uri, int pageIndex, int maxWidth) { return MainActivity.this.renderPdfPage(uri, pageIndex, maxWidth).toString(); }
        @JavascriptInterface public void openExternalUrl(String url) { MainActivity.this.openExternal(url); }
        @JavascriptInterface public void reload() { runOnUiThread(MainActivity.this::loadLocalUi); }
    }
}
