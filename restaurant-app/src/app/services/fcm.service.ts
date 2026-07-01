import { inject, Injectable } from '@angular/core';
import { DeviceService } from './device.service';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed, PushNotifications,
  PushNotificationSchema, Token
} from '@capacitor/push-notifications';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private deviceService = inject(DeviceService);

  async initPush() {
    if (Capacitor.getPlatform() === 'web') {
      console.log('Web platform detected, skipping push notification initialization.');
      return;
    }

    await this.registerListeners();

    let permsStatus = await PushNotifications.checkPermissions();
    if (permsStatus.receive !== 'granted') {
      permsStatus = await PushNotifications.requestPermissions();
    }

    if (permsStatus.receive !== 'granted') {
      throw new Error('FCM : Push notification permission not granted');
    }

    await PushNotifications.register();
  }

  private async registerListeners() {
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM : Push registration success, token: ', token.value);
      await this.saveTokenToFirebase(token.value);
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('FCM : Push registration error: ', error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('FCM : Push notification received: ', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('FCM : Push notification action performed: ', notification);
    });
  }

  private async saveTokenToFirebase(token: string) {
    const deviceId = await this.deviceService.getDeviceId();
    const db = getFirestore();

    await setDoc(doc(db, 'devices', deviceId), {
      fcmToken: token,
      updatedAt: Date.now()
    });

    console.log('FCM : Token saved to Firebase for deviceId: ', deviceId);
  }
}