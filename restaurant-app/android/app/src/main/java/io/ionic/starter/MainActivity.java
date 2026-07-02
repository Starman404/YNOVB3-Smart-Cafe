package ynovbsmartcafe.restaurantapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final String CHANNEL_ID = "smart_cafe_default_v2";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    createNotificationChannel();
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return;
    }

    NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Lux Café",
        NotificationManager.IMPORTANCE_HIGH
    );
    channel.setDescription("Notifications Lux Café");
    channel.enableVibration(true);
    channel.enableLights(true);
    channel.setShowBadge(true);

    NotificationManager manager = getSystemService(NotificationManager.class);
    if (manager != null) {
      manager.createNotificationChannel(channel);
    }
  }
}