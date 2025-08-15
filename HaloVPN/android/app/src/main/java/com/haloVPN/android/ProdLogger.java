package com.haloVPN.android;

import android.util.Log;

public class ProdLogger {
    private static final String DEFAULT_TAG = "HaloVPN";

    public static void info(String msg) {
        Log.i(DEFAULT_TAG, msg);
    }

    public static void error(String msg) {
        Log.e(DEFAULT_TAG, msg);
    }

    public static void error(String msg, Throwable t) {
        Log.e(DEFAULT_TAG, msg, t);
    }
}
