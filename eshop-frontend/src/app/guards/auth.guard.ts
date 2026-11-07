import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../core/state';

/** Port of src/routes/ProtectedRoute.js */
export const authGuard: CanActivateFn = () => {
  const userStore = inject(UserStore); const router = inject(Router);
  if (!userStore.isAuthenticated()) return router.createUrlTree(['/login']);
  return true;
};
