import { Routes } from '@angular/router';
import { RequestList } from './components/request-list/request-list';

export const REQUESTS_ROUTES: Routes = [
  {
    path: '',
    component: RequestList
  }
];