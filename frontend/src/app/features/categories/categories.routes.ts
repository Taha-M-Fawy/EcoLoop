import { Routes } from '@angular/router';
import { CategoryList } from './category-list/category-list';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: CategoryList
  }
];