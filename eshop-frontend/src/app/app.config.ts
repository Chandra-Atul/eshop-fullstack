import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { EventStore, ProductStore, SellerStore, UserStore } from './core/state';
import { PaymentService } from './core/payment.service';

/** Mirrors the bootstrap useEffect() of the React App.js component. */
export function initializeApp() {
  // 1. Resolve tokens synchronously while the injection context is active
  const userStore = inject(UserStore);
  const sellerStore = inject(SellerStore);
  const productStore = inject(ProductStore);
  const eventStore = inject(EventStore);
  const payment = inject(PaymentService);

  // 2. Return the async execution function using the already-injected instances
  return async () => {
    const timeout = (p: Promise<any>) => Promise.race([p, new Promise((r) => setTimeout(r, 8000))]);
    await timeout(Promise.all([
      userStore.loadUser(),
      sellerStore.loadSeller(),
      productStore.getAllProducts(),
      eventStore.getAllEvents(),
      payment.getStripeApiKey(),
    ]));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(),
    { provide: APP_INITIALIZER, useFactory: initializeApp, multi: true },
  ],
};