import { Routes } from '@angular/router';
import { Home } from './shared/components/home/home';
import { NotFound } from './shared/components/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },

  {
    path: 'items',
    loadChildren: () => import('./features/items/items.routes').then(m => m.ITEMS_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
  },
  {
    path: 'requests',
    loadChildren: () => import('./features/requests/requests.routes').then(m => m.REQUESTS_ROUTES)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES)
  },
  {
    path: 'reviews',
    loadChildren: () => import('./features/reviews/reviews.routes').then(m => m.REVIEWS_ROUTES)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES)
  },

  { path: '**', component: NotFound }
];