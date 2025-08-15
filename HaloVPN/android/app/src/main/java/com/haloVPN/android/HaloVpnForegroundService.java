package com.haloVPN.android;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import com.haloVPN.android.ProdLogger;

public class HaloVpnForegroundService extends Service {
    private static final String CHANNEL_ID = "HaloVpnForegroundChannel";
    private static final int NOTIFICATION_ID = 1;

    @Override
    public void onCreate() {
        super.onCreate();
        ProdLogger.info("HaloVpnForegroundService created");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "HaloVPN Foreground",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Foreground channel for HaloVPN ongoing VPN service");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                nm.createNotificationChannel(channel);
            }
        }
    }

    private Notification getNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("HaloVPN")
            .setContentText("VPN is running")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        ProdLogger.info("HaloVpnForegroundService started");
        startForeground(NOTIFICATION_ID, getNotification());
        return START_NOT_STICKY;
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Ensure we stop cleanly if the user swipes away the app
        stopForeground(true);
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        ProdLogger.info("HaloVpnForegroundService destroyed");
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        // Binding not implemented in this skeleton
        return null;
    }
}
