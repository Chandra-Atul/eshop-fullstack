import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { SellerStore, UserStore } from '../../core/state';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
    <div><a routerLink="/"><img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="" /></a></div>
    <div class="flex items-center"><div class="flex items-center mr-4">
      <a routerLink="/dashboard/cupouns" class="800px:block hidden"><app-icon name="AiOutlineGift" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-events" class="800px:block hidden"><app-icon name="MdOutlineLocalOffer" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-products" class="800px:block hidden"><app-icon name="FiShoppingBag" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-orders" class="800px:block hidden"><app-icon name="FiPackage" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-messages" class="800px:block hidden"><app-icon name="BiMessageSquareDetail" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <img [src]="user()?.avatar?.url" alt="" class="w-[50px] h-[50px] rounded-full object-cover" />
    </div></div>
  </div>`,
})
export class AdminHeaderComponent { private userStore = inject(UserStore); user = this.userStore.user; }

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="w-full h-[80px] bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4">
    <div><a routerLink="/dashboard"><img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="" /></a></div>
    <div class="flex items-center"><div class="flex items-center mr-4">
      <a routerLink="/dashboard/cupouns" class="800px:block hidden"><app-icon name="AiOutlineGift" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-events" class="800px:block hidden"><app-icon name="MdOutlineLocalOffer" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-products" class="800px:block hidden"><app-icon name="FiShoppingBag" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-orders" class="800px:block hidden"><app-icon name="FiPackage" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a routerLink="/dashboard-messages" class="800px:block hidden"><app-icon name="BiMessageSquareDetail" [size]="30" color="#555" class="mx-5 cursor-pointer" /></a>
      <a [routerLink]="['/shop', seller()?._id]"><img [src]="seller()?.avatar?.url" alt="" class="w-[50px] h-[50px] rounded-full object-cover" /></a>
    </div></div>
  </div>`,
})
export class DashboardHeaderComponent { private sellerStore = inject(SellerStore); seller = this.sellerStore.seller; }
