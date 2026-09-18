import { Routes } from '@angular/router';

export const ITEM_ROUTES: Routes = [
 {
    path: '',
    loadComponent: () => import('./components/item-list/item-list').then(m => m.ItemListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./components/item-form/item-form').then(m => m.ItemFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/item-form/item-form').then(m => m.ItemFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/item-details/item-details').then(m => m.ItemDetailsComponent)
  }
];