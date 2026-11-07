import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../core/state';

/** Port of src/routes/ProtectedAdminRoute.js */
export const adminGuard: CanActivateFn = () => {
  const userStore = inject(UserStore); const router = inject(Router);
  if (!userStore.isAuthenticated()) return router.createUrlTree(['/login']);
  if (userStore.user()?.role !== 'Admin') return router.createUrlTree(['/']);
  return true;
};
