import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { SellerStore, UserStore } from '../../core/state';

// ==========================================
// 1. ADMIN HEADER COMPONENT
// ==========================================
@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full h-[80px] bg-white shadow-sm border-b border-gray-100 sticky top-0 left-0 z-30 flex items-center justify-between px-6">
      <!-- Admin Brand Logo -->
      <div>
        <a routerLink="/admin/dashboard" class="flex items-center gap-2.5 select-none group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3321c8] to-[#5b42f3] flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-black tracking-tight text-gray-900 leading-none">
              Shop<span class="text-[#3321c8]">O</span>
            </span>
            <span class="text-[10px] tracking-widest uppercase font-bold text-red-500 mt-0.5">Admin Panel</span>
          </div>
        </a>
      </div>

      <!-- Action Navigation -->
      <div class="flex items-center gap-2">
        <a routerLink="/admin/dashboard" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Admin Dashboard">
          <app-icon name="MdOutlineAdminPanelSettings" [size]="26" color="#555" />
        </a>
        <a routerLink="/admin-events" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Events">
          <app-icon name="MdOutlineLocalOffer" [size]="26" color="#555" />
        </a>
        <a routerLink="/admin-products" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Products">
          <app-icon name="FiShoppingBag" [size]="26" color="#555" />
        </a>
        <a routerLink="/admin-orders" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Orders">
          <app-icon name="FiPackage" [size]="26" color="#555" />
        </a>
        <a routerLink="/admin-messages" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Messages">
          <app-icon name="BiMessageSquareDetail" [size]="26" color="#555" />
        </a>

        <!-- User Profile -->
        <a routerLink="/profile" class="flex items-center ml-4 pl-4 border-l border-gray-200">
          @if (user()?.avatar?.url) {
            <img [src]="user()?.avatar?.url" alt="Avatar" class="w-[45px] h-[45px] rounded-full object-cover border border-gray-200 shadow-sm" />
          } @else {
            <div class="w-[45px] h-[45px] rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <app-icon name="RxAvatar" [size]="32" color="#666" />
            </div>
          }
        </a>
      </div>
    </div>
  `,
})
export class AdminHeaderComponent {
  private userStore = inject(UserStore);
  user = this.userStore.user;
}

// ==========================================
// 2. SELLER DASHBOARD HEADER COMPONENT
// ==========================================
@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full h-[80px] bg-white shadow-sm border-b border-gray-100 sticky top-0 left-0 z-30 flex items-center justify-between px-6">
      <!-- Seller Brand Logo -->
      <div>
        <a routerLink="/dashboard" class="flex items-center gap-2.5 select-none group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3321c8] to-[#5b42f3] flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-black tracking-tight text-gray-900 leading-none">
              Shop<span class="text-[#3321c8]">O</span>
            </span>
            <span class="text-[10px] tracking-widest uppercase font-bold text-teal-600 mt-0.5">Seller Center</span>
          </div>
        </a>
      </div>

      <!-- Action Navigation -->
      <div class="flex items-center gap-2">
        <a routerLink="/dashboard-coupons" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Coupons">
          <app-icon name="AiOutlineGift" [size]="26" color="#555" />
        </a>
        <a routerLink="/dashboard-events" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Events">
          <app-icon name="MdOutlineLocalOffer" [size]="26" color="#555" />
        </a>
        <a routerLink="/dashboard-products" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Products">
          <app-icon name="FiShoppingBag" [size]="26" color="#555" />
        </a>
        <a routerLink="/dashboard-orders" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Orders">
          <app-icon name="FiPackage" [size]="26" color="#555" />
        </a>
        <a routerLink="/dashboard-messages" class="hidden 800px:flex items-center p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition" title="Messages">
          <app-icon name="BiMessageSquareDetail" [size]="26" color="#555" />
        </a>

        <!-- Shop Avatar: normalized for both _id and numeric id -->
        <div class="ml-4 pl-4 border-l border-gray-200 flex items-center">
          @if (shopId()) {
            <a [routerLink]="['/shop', shopId()]" class="flex items-center group">
              @if (seller()?.avatar?.url) {
                <img [src]="seller()?.avatar?.url" alt="Shop Avatar" class="w-[45px] h-[45px] rounded-full object-cover border border-gray-200 shadow-sm group-hover:ring-2 group-hover:ring-[#3321c8] transition" />
              } @else {
                <div class="w-[45px] h-[45px] rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#3321c8] font-bold text-lg">
                  {{ (seller()?.name ? seller()?.name.charAt(0).toUpperCase() : 'S') }}
                </div>
              }
            </a>
          } @else {
            <div class="w-[45px] h-[45px] rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <app-icon name="RxAvatar" [size]="32" color="#666" />
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class DashboardHeaderComponent {
  private sellerStore = inject(SellerStore);
  seller = this.sellerStore.seller;

  shopId = computed(() => {
    const s: any = this.seller();
    return s?._id || s?.id || null;
  });
}