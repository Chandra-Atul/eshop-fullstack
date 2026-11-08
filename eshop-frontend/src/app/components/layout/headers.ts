import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { SellerStore, UserStore } from '../../core/state';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      <div>
        <a routerLink="/">
          <img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="Logo" />
        </a>
      </div>
      <div class="flex items-center">
        <div class="flex items-center mr-4">
          <a routerLink="/admin/dashboard" class="800px:block hidden" title="Admin Dashboard">
            <app-icon name="MdOutlineAdminPanelSettings" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/admin-events" class="800px:block hidden" title="Events">
            <app-icon name="MdOutlineLocalOffer" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/admin-products" class="800px:block hidden" title="Products">
            <app-icon name="FiShoppingBag" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/admin-orders" class="800px:block hidden" title="Orders">
            <app-icon name="FiPackage" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/admin-messages" class="800px:block hidden" title="Messages">
            <app-icon name="BiMessageSquareDetail" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>

          <!-- Profile Link with Fallback Icon -->
          <a routerLink="/profile" class="flex items-center">
            @if (user()?.avatar?.url) {
              <img [src]="user()?.avatar?.url" alt="Avatar" class="w-[50px] h-[50px] rounded-full object-cover border" />
            } @else {
              <app-icon name="RxAvatar" [size]="50" color="#555" />
            }
          </a>
        </div>
      </div>
    </div>
  `,
})
export class AdminHeaderComponent {
  private userStore = inject(UserStore);
  user = this.userStore.user;
}

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
      <div>
        <a routerLink="/dashboard">
          <img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="Logo" />
        </a>
      </div>
      <div class="flex items-center">
        <div class="flex items-center mr-4">
          <a routerLink="/dashboard-coupons" class="800px:block hidden" title="Coupons">
            <app-icon name="AiOutlineGift" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/dashboard-events" class="800px:block hidden" title="Events">
            <app-icon name="MdOutlineLocalOffer" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/dashboard-products" class="800px:block hidden" title="Products">
            <app-icon name="FiShoppingBag" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/dashboard-orders" class="800px:block hidden" title="Orders">
            <app-icon name="FiPackage" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>
          <a routerLink="/dashboard-messages" class="800px:block hidden" title="Messages">
            <app-icon name="BiMessageSquareDetail" [size]="30" color="#555" class="mx-5 cursor-pointer" />
          </a>

          <!-- Shop Avatar with Fallback Icon -->
          @if (seller()?._id) {
            <a [routerLink]="['/shop', seller()?._id]" class="flex items-center">
              @if (seller()?.avatar?.url) {
                <img [src]="seller()?.avatar?.url" alt="Shop Avatar" class="w-[50px] h-[50px] rounded-full object-cover border" />
              } @else {
                <app-icon name="RxAvatar" [size]="50" color="#555" />
              }
            </a>
          } @else {
            <app-icon name="RxAvatar" [size]="50" color="#555" />
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardHeaderComponent {
  private sellerStore = inject(SellerStore);
  seller = this.sellerStore.seller;
}