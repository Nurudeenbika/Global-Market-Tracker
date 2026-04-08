import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    title: 'Global Market Tracker — Dashboard',
  },
  {
    path: 'watchlist',
    loadComponent: () =>
      import('./features/watchlist/watchlist.component').then(
        (m) => m.WatchlistComponent
      ),
    title: 'Global Market Tracker — Watchlist',
  },
  {
    path: 'asset/:id',
    loadComponent: () =>
      import('./features/asset-detail/asset-detail.component').then(
        (m) => m.AssetDetailComponent
      ),
    title: 'Global Market Tracker — Asset Detail',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
