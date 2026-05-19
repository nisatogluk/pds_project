import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (user && user.role === 'Admin') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};