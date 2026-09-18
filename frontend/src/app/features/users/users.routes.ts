import { Routes } from '@angular/router';
import { Users } from './users';
import { adminGuard } from '../../core/guards/admin.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: Users,
    canActivate: [adminGuard]
  }
];