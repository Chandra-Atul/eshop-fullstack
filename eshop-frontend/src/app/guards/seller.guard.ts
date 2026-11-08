import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { SellerStore } from '../core/state';

/** Port of src/routes/SellerProtectedRoute.js */
export const sellerGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const sellerStore = inject(SellerStore);
  const router = inject(Router);

  // 1. If already confirmed as seller in memory, grant access immediately
  if (sellerStore.isSeller() === true) {
    return true;
  }

  // 2. If seller state is unresolved, wait for loadSeller() to complete
  if (sellerStore.isSeller() === undefined || sellerStore.seller() === null) {
    const isSeller = await sellerStore.loadSeller();
    if (isSeller) {
      return true;
    }
  }

  // 3. Fallback: Check if seller token exists in storage or cookies
  const hasToken =
      typeof window !== 'undefined' &&
      (!!localStorage.getItem('seller_token') ||
          !!localStorage.getItem('token') ||
          document.cookie.includes('seller_token='));

  if (hasToken) {
    return true;
  }

  // 4. Truly not authenticated as seller -> redirect to /shop-login
  return router.createUrlTree(['/shop-login']);
};