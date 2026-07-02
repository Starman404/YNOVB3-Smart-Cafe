import { inject, Injectable } from '@angular/core';
import { DeviceService } from './device.service';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed, PushNotifications,
  PushNotificationSchema, Token
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private deviceService = inject(DeviceService);

  private static readonly CHANNEL_ID = 'smart_cafe_default_v2';

  private initialized = false;
  private localNotifIdCounter = 1;

  async initPush() {
    if (this.initialized) {
      console.log('FCM : initPush already called, skipping duplicate init.');
      return;
    }
    this.initialized = true;

    if (Capacitor.getPlatform() === 'web') {
      console.log('Web platform detected, skipping push notification initialization.');
      return;
    }

    await this.registerListeners();
    await this.ensureLocalNotificationChannel();
    await this.ensureLocalNotificationPermission();

    let permsStatus = await PushNotifications.checkPermissions();
    if (permsStatus.receive !== 'granted') {
      permsStatus = await PushNotifications.requestPermissions();
    }

    if (permsStatus.receive !== 'granted') {
      console.warn('FCM : Push notification permission not granted; notifications will stay disabled until the user enables them in Android settings.');
      return;
    }

    console.log('FCM : Registering device with push provider...');
    await PushNotifications.register();
    console.log('FCM : Registration request sent.');
  }

  private async ensureLocalNotificationChannel() {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      await LocalNotifications.createChannel({
        id: FcmService.CHANNEL_ID,
        name: 'Lux Café',
        description: 'Notifications Lux Café',
        importance: 5, // IMPORTANCE_HIGH
        visibility: 1,
        vibration: true,
      });
    } catch (err) {
      console.warn('FCM : Unable to create local notification channel', err);
    }
  }

  private async ensureLocalNotificationPermission() {
    if (Capacitor.getPlatform() === 'web') return;

    let status = await LocalNotifications.checkPermissions();
    if (status.display !== 'granted') {
      status = await LocalNotifications.requestPermissions();
    }
    if (status.display !== 'granted') {
      console.warn('FCM : Local notification permission not granted; foreground pushes will only log, not display.');
    }
  }

  private async registerListeners() {
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM : Push registration success, token: ', token.value);
      await this.saveTokenToFirebase(token.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('FCM : Push registration error: ', error);
    });

    await PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
      console.log('FCM : Push notification received: ', notification);
      await this.showLocalNotification(notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('FCM : Push notification action performed: ', notification);
    });
  }

  private async showLocalNotification(notification: PushNotificationSchema) {
    const title = notification.title ?? notification.data?.['title'] ?? 'Lux Café';
    const body = notification.body ?? notification.data?.['body'] ?? 'Vous avez une nouvelle notification';

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: this.localNotifIdCounter++,
            title,
            body,
            channelId: FcmService.CHANNEL_ID,
            sound: undefined, // let the channel's default sound play
          },
        ],
      });
    } catch (err) {
      console.error('FCM : Failed to display local notification', err);
    }
  }

  private async saveTokenToFirebase(token: string) {
    const deviceId = await this.deviceService.getDeviceId();
    const db = getFirestore();
    const ref = doc(db, 'devices', deviceId);
    const existing = await getDoc(ref);

    await setDoc(ref, {
      fcmToken: token,
      updatedAt: Date.now(),
      lastSeenAt: Date.now(),
      platform: Capacitor.getPlatform(),
      ...(existing.exists() ? { previousFcmToken: existing.data()?.['fcmToken'] } : {}),
    }, { merge: true });

    console.log('FCM : Token saved to Firebase for deviceId: ', deviceId, 'token:', token);
  }
}