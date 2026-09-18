import { Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { TransactionCreateComponent } from './components/transaction-create/transaction-create.component';
import { TransactionUpdateComponent } from './components/transaction-update/transaction-update.component';

export const TRANSACTIONS_ROUTES: Routes = [
  { path: '', component: TransactionListComponent },
  { path: 'create', component: TransactionCreateComponent },
  { path: ':id', component: TransactionDetailsComponent },
  { path: 'edit/:id', component: TransactionUpdateComponent }
];
