import { Routes } from '@angular/router';
import { Profile } from './profile';
import { authGuard } from '../../core/guards/auth-guard';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: Profile,
    canActivate: [authGuard]
  }
];