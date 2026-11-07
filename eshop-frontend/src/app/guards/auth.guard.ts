import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserStore } from '../core/state';

export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  // If already authenticated in memory, allow entry immediately
  if (userStore.isAuthenticated()) {
    return true;
  }

  // If user hasn't loaded yet, await loadUser from backend
  if (userStore.user() === null) {
    const isAuth = await userStore.loadUser();
    if (isAuth) {
      return true;
    }
  }

  // Not authenticated -> redirect to login
  return router.createUrlTree(['/login']);
};