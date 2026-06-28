import { Injectable } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lux_theme';

/**
 * Responsable uniquement du thème clair/sombre : lecture, application,
 * persistance entre les sessions (préférence de l'appareil, pas de la table).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private current: Theme = this.restore();

  constructor() {
    this.apply(this.current);
  }

  get theme(): Theme {
    return this.current;
  }

  setTheme(theme: Theme) {
    this.current = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    this.apply(theme);
  }

  toggle() {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
  }

  private restore(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  }
}