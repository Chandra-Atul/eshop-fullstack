import { Component, OnInit, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ShopLoginComponent } from '../components/shop/shop-auth';
import { SellerStore } from '../core/state';
import { LoaderComponent } from '../components/layout/loader.component';

@Component({
  selector: 'app-shop-login-page',
  standalone: true,
  imports: [ShopLoginComponent, LoaderComponent],
  template: `
    @if (sellerStore.isLoading()) {
      <app-loader />
    } @else {
      <div>
        <app-shop-login />
      </div>
    }
  `,
})
export class ShopLoginPageComponent implements OnInit {
  protected sellerStore = inject(SellerStore);
  private router = inject(Router);

  constructor() {
    effect(() => {
      // If already authenticated as seller, redirect to dashboard
      if (this.sellerStore.isSeller() === true) {
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      }
    });
  }

  ngOnInit() {
    // If seller state hasn't resolved, initiate check
    if (this.sellerStore.isSeller() === undefined) {
      this.sellerStore.loadSeller();
    }
  }
}