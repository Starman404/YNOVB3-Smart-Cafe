import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonInput, IonButton, IonItem
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type Mode = 'login' | 'signup';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonItem],
})
export class LoginPage {
  mode: Mode = 'login';
  email = '';
  password = '';
  name = '';
  submitting = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  switchMode() {
    this.mode = this.mode === 'login' ? 'signup' : 'login';
    this.error = '';
  }

  async submit() {
    if (!this.email || !this.password || (this.mode === 'signup' && !this.name)) {
      this.error = 'Merci de remplir tous les champs.';
      return;
    }

    this.submitting = true;
    this.error = '';

    const result = this.mode === 'login'
      ? await this.auth.signIn(this.email, this.password)
      : await this.auth.signUp(this.email, this.password, this.name);

    this.submitting = false;

    if (!result.success) {
      this.error = result.errorMessage ?? 'Une erreur est survenue.';
      return;
    }

    this.router.navigateByUrl('/tabs/menu');
  }

  continueAsGuest() {
    this.router.navigateByUrl('/tabs/menu');
  }
}