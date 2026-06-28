import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonButton, IonToggle, AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonButton, IonToggle],
})
export class SettingsPage implements OnInit {
  isLoggedIn = false;
  userEmail = '';
  userName = '';

  isLightTheme = false;

  message = '';
  error = '';

  constructor(
    private auth: AuthService,
    private theme: ThemeService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn;
    this.isLightTheme = this.theme.theme === 'light';

    if (this.isLoggedIn) {
      this.userEmail = this.auth.currentUserEmail ?? '';
      this.userName = (await this.auth.getMyAccountName()) ?? '';
    }
  }

  onThemeToggle(event: any) {
    this.theme.setTheme(event.detail.checked ? 'light' : 'dark');
  }

  async editName() {
    const alert = await this.alertCtrl.create({
      header: 'Modifier le nom',
      inputs: [{ name: 'name', type: 'text', value: this.userName, placeholder: 'Votre nom' }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            const newName = (data.name ?? '').trim();
            if (!newName) return false;

            const result = await this.auth.updateName(newName);
            if (!result.success) {
              this.error = result.errorMessage ?? 'Erreur lors de la mise à jour.';
              return false;
            }

            this.userName = newName;
            this.message = 'Nom mis à jour.';
            this.error = '';
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editEmail() {
    const alert = await this.alertCtrl.create({
      header: "Modifier l'email",
      inputs: [{ name: 'email', type: 'email', value: this.userEmail, placeholder: 'Votre email' }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            const newEmail = (data.email ?? '').trim();
            if (!newEmail) return false;

            const result = await this.auth.updateEmail(newEmail);
            if (!result.success) {
              this.error = result.errorMessage ?? 'Erreur lors de la mise à jour.';
              return false;
            }

            this.userEmail = newEmail;
            this.message = 'Email mis à jour. Vérifiez votre boîte mail si une confirmation est requise.';
            this.error = '';
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async editPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Changer le mot de passe',
      inputs: [
        { name: 'password', type: 'password', placeholder: 'Nouveau mot de passe (6 caractères min.)' },
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Enregistrer',
          handler: async (data) => {
            const newPassword = data.password ?? '';
            if (newPassword.length < 6) {
              this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
              return false;
            }

            const result = await this.auth.updatePassword(newPassword);
            if (!result.success) {
              this.error = result.errorMessage ?? 'Erreur lors de la mise à jour.';
              return false;
            }

            this.message = 'Mot de passe mis à jour.';
            this.error = '';
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}