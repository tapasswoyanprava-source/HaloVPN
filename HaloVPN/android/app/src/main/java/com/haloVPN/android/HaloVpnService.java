package com.haloVPN.android;

import android.content.Intent;
import android.net.VpnService;
import android.os.IBinder;
import android.os.ParcelFileDescriptor;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.io.IOException;

public class HaloVpnService extends VpnService {
    private static final String TAG = "HaloVpnService";
    public static final String ACTION_STOP_VPN = "com.haloVPN.android.action.STOP_VPN";
    private ParcelFileDescriptor vpnInterface;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        ProdLogger.info("HaloVpnService started (production)");
        // Handle STOP_VPN action to robustly tear down the VPN and stop service
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_STOP_VPN.equals(action)) {
                stopVpnAndSelf();
                return START_NOT_STICKY;
            }
        }

        if (vpnInterface == null) {
            try {
                VpnService.Builder builder = new Builder();
                builder.setSession("HaloVPN")
                       .setMtu(1500)
                       .addAddress("10.0.0.2", 24)
                       .addRoute("0.0.0.0", 0);
                vpnInterface = builder.establish();
                ProdLogger.info("VPN interface established");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    Intent foregroundIntent = new Intent(this, HaloVpnForegroundService.class);
                    startForegroundService(foregroundIntent);
                }
            } catch (Exception e) {
                ProdLogger.error("Failed to establish VPN", e);
            }
        }
        return START_STICKY;
    }

    private void stopVpnAndSelf() {
        ProdLogger.info("HaloVpnService stopping VPN (STOP_VPN)");
        // Stop any foreground notification
        try {
            stopForeground(true);
        } catch (Exception ignore) { }

        // Tear down VPN interface if present
        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (IOException ioe) {
                ProdLogger.error("Error closing VPN interface", ioe);
            } finally {
                vpnInterface = null;
            }
        }

        // Stop the service
        try {
            stopSelf();
        } catch (Exception ignore) { }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        ProdLogger.info("HaloVpnService destroyed");
        // Ensure clean shutdown of VPN if service is torn down externally
        try {
            stopForeground(true);
        } catch (Exception ignore) { }
        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (IOException ioe) {
                ProdLogger.error("Error closing VPN interface", ioe);
            } finally {
                vpnInterface = null;
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        // Binding not implemented in this skeleton
        return null;
    }
}
