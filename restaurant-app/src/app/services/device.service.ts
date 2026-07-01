import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private DEVICE_ID_KEY = 'device_Id';

  async getDeviceId(): Promise<string> {
    const storedId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (storedId) {
      return storedId;
    }
    const deviceId = crypto.randomUUID();
    localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    return deviceId;
  }
}
