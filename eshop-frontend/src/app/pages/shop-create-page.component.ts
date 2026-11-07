import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShopCreateComponent } from '../components/shop/shop-auth';
import { SellerStore } from '../core/state';

@Component({ selector: 'app-shop-create-page', standalone: true, imports: [ShopCreateComponent], template: `<div><app-shop-create /></div>` })
export class ShopCreatePageComponent {
  private sellerStore = inject(SellerStore); private router = inject(Router);
  constructor() { effect(() => { if (this.sellerStore.isSeller() === true) this.router.navigate(['/shop', this.sellerStore.seller()?._id]); }); }
}
