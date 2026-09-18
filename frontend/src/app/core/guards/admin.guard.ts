import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

export const adminGuard = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const role = authService.getRole();

  if (token && role === 'admin') {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};