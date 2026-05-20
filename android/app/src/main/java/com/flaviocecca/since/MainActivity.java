package com.flaviocecca.since;

import android.graphics.Color;
import android.os.Bundle;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SinceBiometricsPlugin.class);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(Color.rgb(247, 241, 233));
        getWindow().setNavigationBarColor(Color.WHITE);
        super.onCreate(savedInstanceState);
    }
}
