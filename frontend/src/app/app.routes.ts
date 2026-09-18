import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { AdminDashboard } from './features/admin-dashboard/admin-dashboard';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'items',
    loadChildren: () =>
      import('./features/items/items.routes').then(m => m.ITEMS_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'requests',
    loadChildren: () =>
      import('./features/requests/requests.routes').then(m => m.REQUESTS_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'transactions',
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'reviews',
    loadChildren: () =>
      import('./features/reviews/reviews.routes').then(m => m.REVIEWS_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'notifications',
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
    canActivate: [authGuard]
  },

  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES)
  },

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [adminGuard]
  },

  {
    path: '**',
    component: NotFound
  }
];