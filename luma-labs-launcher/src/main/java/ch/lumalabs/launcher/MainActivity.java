package ch.lumalabs.launcher;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

public class MainActivity extends Activity {
    private static final Uri TARGET = Uri.parse("https://lumalabs.ch/");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(Intent.ACTION_VIEW, TARGET);
        intent.addCategory(Intent.CATEGORY_BROWSABLE);
        startActivity(intent);
        finish();
    }
}
