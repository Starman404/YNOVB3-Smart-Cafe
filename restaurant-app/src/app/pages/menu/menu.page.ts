import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuService, Category, MenuItem } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';

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
  favoriteItems: MenuItem[] = [];
  allItems: MenuItem[] = [];
  isLoggedIn = false;
  loading = true;
  cartCount = 0;
  cartTotal = 0;

  constructor(
    private menuService: MenuService,
    private cart: CartService,
    private favorites: FavoritesService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn;
    await this.loadMenu();

    this.cart.lines$.subscribe(() => {
      this.cartCount = this.cart.count;
      this.cartTotal = this.cart.total;
    });

    this.favorites.favorites$.subscribe(() => {
      this.updateFavoriteItems();
    });
  }

  private async loadMenu() {
    this.loading = true;

    const [categories, items] = await Promise.all([
      this.menuService.getCategories(),
      this.menuService.getAvailableItems(),
      this.favorites.load(),
    ]);

    this.categories = categories;
    this.allItems = items;
    this.itemsByCategory = this.menuService.groupByCategory(items);
    this.updateFavoriteItems();
    this.loading = false;
  }

  private updateFavoriteItems() {
    this.favoriteItems = this.allItems.filter((i) =>
      this.favorites.isFavorite(i.menu_id)
    );
  }

  isFavorite(menuId: number): boolean {
    return this.favorites.isFavorite(menuId);
  }

  async toggleFavorite(event: Event, item: MenuItem) {
    event.stopPropagation(); // empêche l'ajout au panier
    if (!this.isLoggedIn) return;
    await this.favorites.toggle(item.menu_id);
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