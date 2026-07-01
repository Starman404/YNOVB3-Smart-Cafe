import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService, RestaurantTable } from '../../services/table.service';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

type ViewMode = 'scan' | 'manual';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton],
})
export class LandingPage implements OnInit {
  viewMode: ViewMode = 'scan';

  tableNumberInput = '';
  table: RestaurantTable | null = null;
  checking = false;
  scanning = false;
  error = '';

  constructor(
    private tableService: TableService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.table = this.tableService.current;

    // Lien direct (deep link) : /landing?table=12 -> vérification automatique,
    // sans passer par la caméra (utile pour les tests web/desktop notamment).
    const qrTable = this.route.snapshot.queryParamMap.get('table');
    if (qrTable && !this.table) {
      this.tableNumberInput = qrTable;
      await this.confirmTable();
    }
  }

  switchToManual() {
    this.viewMode = 'manual';
    this.error = '';
  }

  switchToScan() {
    this.viewMode = 'scan';
    this.error = '';
  }

  async startScan() {
    this.error = '';

    const { camera } = await BarcodeScanner.requestPermissions();
    if (camera !== 'granted' && camera !== 'limited') {
      this.error = "Merci d'autoriser l'accès à la caméra pour scanner le QR code.";
      return;
    }

    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();

    if (!available) {
      this.scanning = true;

      // On s'abonne à l'événement de fin d'installation avant de déclencher
      // le téléchargement — sinon on lance scan() alors que le module n'est
      // pas encore prêt.
      await new Promise<void>((resolve, reject) => {
        BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', (event: any) => {
          if (event.state === 'completed') {
            resolve();
          } else if (event.state === 'failed') {
            reject(new Error('Installation échouée'));
          }
        });

        BarcodeScanner.installGoogleBarcodeScannerModule().catch(reject);
      }).catch(() => {
        this.scanning = false;
        this.error = "Impossible d'installer le module de scan. Vérifiez votre connexion et réessayez.";
        return;
      });

      if (!this.scanning) return;
    }

    this.scanning = true;

    try {
      const { barcodes } = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
      this.scanning = false;

      const rawValue = barcodes[0]?.rawValue;
      if (!rawValue) {
        this.error = 'Aucun QR code détecté. Réessayez.';
        return;
      }

      const tableNumber = this.extractTableNumber(rawValue);
      if (!tableNumber) {
        this.error = "Ce QR code ne correspond pas à une table de l'établissement.";
        return;
      }

      this.tableNumberInput = String(tableNumber);
      await this.confirmTable();
    } catch (err) {
      this.scanning = false;
      this.error = 'Le scan a été interrompu. Réessayez.';
    }
  }

  /**
   * Le QR code encode une URL complète (ex. https://monapp.com/landing?table=12).
   * On en extrait juste le numéro de table.
   */
  private extractTableNumber(rawValue: string): number | null {
    try {
      const url = new URL(rawValue);
      const table = url.searchParams.get('table');
      return table ? parseInt(table, 10) : null;
    } catch {
      return null;
    }
  }

  async confirmTable() {
    const number = parseInt(this.tableNumberInput, 10);
    if (!number) {
      this.error = 'Merci de saisir un numéro de table valide.';
      return;
    }

    this.checking = true;
    this.error = '';

    const table = await this.tableService.resolveByNumber(number);

    this.checking = false;

    if (!table) {
      this.error = 'Table introuvable. Demandez à un membre du personnel.';
      return;
    }

    this.table = table;
  }

  changeTable() {
    this.tableService.clear();
    this.table = null;
    this.tableNumberInput = '';
    this.viewMode = 'scan';
  }

  goNext() {
    this.router.navigateByUrl('/login');
  }
}