import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'menu',
        loadComponent: () => import('./pages/menu/menu.page').then((m) => m.MenuPage),
      },
      {
        path: 'order',
        loadComponent: () => import('./pages/order/order.page').then((m) => m.OrderPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      { path: '', redirectTo: 'menu', pathMatch: 'full' },
    ],
  },
  {
    path: 'order-history',
    loadComponent: () =>
      import('./pages/order-history/order-history.page').then((m) => m.OrderHistoryPage),
  },
  { path: '**', redirectTo: 'landing' },
];
