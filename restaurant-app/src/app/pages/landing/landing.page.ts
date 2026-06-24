import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService, RestaurantTable } from '../../services/table.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton],
})
export class LandingPage implements OnInit {
  tableNumberInput = '';
  table: RestaurantTable | null = null;
  checking = false;
  error = '';

  constructor(
    private tableService: TableService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.table = this.tableService.current;

    // QR code : /landing?table=12 -> on vérifie automatiquement
    const qrTable = this.route.snapshot.queryParamMap.get('table');
    if (qrTable && !this.table) {
      this.tableNumberInput = qrTable;
      await this.confirmTable();
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
  }

  goNext() {
    // Étape 3 ajoutera la vraie page de login ; pour l'instant on va directement aux tabs.
    this.router.navigateByUrl('/login');
  }
}
