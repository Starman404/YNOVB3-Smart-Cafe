import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartLine {
  menu_id: number;
  menu_name: string;
  unit_price: number;
  quantity: number;
}

const STORAGE_KEY = 'lux_cart';

/**
 * Responsable uniquement de l'état du panier : ajout, quantité, total,
 * persistance pour la session en cours. Ne connaît rien au menu ni aux
 * commandes (SRP) — il reçoit déjà les infos nécessaires en paramètre.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly linesSubject = new BehaviorSubject<CartLine[]>(this.restore());
  readonly lines$ = this.linesSubject.asObservable();

  get snapshot(): CartLine[] {
    return this.linesSubject.value;
  }

  get total(): number {
    return this.snapshot.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  }

  get count(): number {
    return this.snapshot.reduce((sum, l) => sum + l.quantity, 0);
  }

  add(item: { menu_id: number; menu_name: string; price: number }) {
    const lines = [...this.snapshot];
    const existing = lines.find((l) => l.menu_id === item.menu_id);

    if (existing) {
      existing.quantity++;
    } else {
      lines.push({ menu_id: item.menu_id, menu_name: item.menu_name, unit_price: item.price, quantity: 1 });
    }

    this.persist(lines);
  }

  updateQuantity(menu_id: number, quantity: number) {
    let lines = [...this.snapshot];

    if (quantity <= 0) {
      lines = lines.filter((l) => l.menu_id !== menu_id);
    } else {
      const line = lines.find((l) => l.menu_id === menu_id);
      if (line) line.quantity = quantity;
    }

    this.persist(lines);
  }

  clear() {
    this.persist([]);
  }

  private persist(lines: CartLine[]) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    this.linesSubject.next(lines);
  }

  private restore(): CartLine[] {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
