import { Component } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [IonContent, IonButton],
})
export class LoginPage {
  constructor(private router: Router) {}

  goToTabs() {
    this.router.navigateByUrl('/tabs');
  }
}