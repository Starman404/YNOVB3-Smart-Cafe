import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  standalone: true,
  imports: [IonContent],
})
export class LandingPage {
  // Étape 2 : détection de la table depuis le QR code
}
