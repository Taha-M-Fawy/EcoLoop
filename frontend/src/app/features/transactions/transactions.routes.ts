import { Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { authGuard } from '../../core/guards/auth-guard';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    component: TransactionListComponent,
    canActivate: [authGuard]
  }
];
