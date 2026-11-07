import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShopLoginComponent } from '../components/shop/shop-auth';
import { SellerStore } from '../core/state';

@Component({ selector: 'app-shop-login-page', standalone: true, imports: [ShopLoginComponent], template: `<div><app-shop-login /></div>` })
export class ShopLoginPageComponent {
  private sellerStore = inject(SellerStore); private router = inject(Router);
  constructor() { effect(() => { if (this.sellerStore.isSeller() === true) this.router.navigate(['/dashboard']); }); }
}
