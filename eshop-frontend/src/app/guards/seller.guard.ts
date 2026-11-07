import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SellerStore } from '../core/state';

/** Port of src/routes/SellerProtectedRoute.js */
export const sellerGuard: CanActivateFn = () => {
  const sellerStore = inject(SellerStore); const router = inject(Router);
  if (sellerStore.isLoading() === true) return true;
  if (!sellerStore.isSeller()) return router.createUrlTree(['/shop-login']);
  return true;
};
