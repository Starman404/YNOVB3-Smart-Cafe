import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { restaurantOutline, receiptOutline, settingsOutline } from 'ionicons/icons';
import { ThemeService } from './services/theme.service';
import { FcmService } from './services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private fcmService = inject(FcmService);
  
  constructor(private themeService: ThemeService) {
    addIcons({ restaurantOutline, receiptOutline, settingsOutline });

    this.fcmService.initPush().catch((error) => {
      console.error('Error initializing push notifications:', error);
    });
  }
}