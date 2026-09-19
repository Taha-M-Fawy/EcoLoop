import { Routes } from '@angular/router';
import { RequestList } from './components/request-list/request-list';
import { RequestCreate } from './components/request-create/request-create';

export const REQUESTS_ROUTES: Routes = [
  {
    path: '',
    component: RequestList
  },
  {
    path: 'new',
    component: RequestCreate
  }
];