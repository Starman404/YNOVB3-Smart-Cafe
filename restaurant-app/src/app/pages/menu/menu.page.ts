import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuService, Category, MenuItem } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class MenuPage implements OnInit {
  categories: Category[] = [];
  itemsByCategory: Record<number, MenuItem[]> = {};
  loading = true;
  cartCount = 0;
  cartTotal = 0;

  constructor(
    private menuService: MenuService,
    private cart: CartService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadMenu();

    this.cart.lines$.subscribe(() => {
      this.cartCount = this.cart.count;
      this.cartTotal = this.cart.total;
    });
  }

  private async loadMenu() {
    this.loading = true;

    const [categories, items] = await Promise.all([
      this.menuService.getCategories(),
      this.menuService.getAvailableItems(),
    ]);

    this.categories = categories;
    this.itemsByCategory = this.menuService.groupByCategory(items);
    this.loading = false;
  }

  scrollTo(categoryId: number) {
    document.getElementById('cat-' + categoryId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  addToCart(item: MenuItem) {
    this.cart.add({ menu_id: item.menu_id, menu_name: item.menu_name, price: item.price });
  }

  goToOrder() {
    this.router.navigateByUrl('/tabs/order');
  }
}