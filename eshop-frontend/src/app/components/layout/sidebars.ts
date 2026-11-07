import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';

interface Item { link: string; icon: string; title: string; index: number; }

@Component({
  selector: 'app-admin-side-bar',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10">
    @for (item of items; track item.index) {
      <div class="w-full flex items-center p-4"><a [routerLink]="item.link" class="w-full flex items-center">
        <app-icon [name]="item.icon" [size]="30" [color]="active === item.index ? 'crimson' : '#555'" />
        <h5 class="hidden 800px:block pl-2 text-[18px] font-[400] {{ active === item.index ? 'text-[crimson]' : 'text-[#555]' }}">{{ item.title }}</h5>
      </a></div>
    }
  </div>`,
})
export class AdminSideBarComponent {
  @Input() active?: number;
  items: Item[] = [
    { link: '/admin/dashboard', icon: 'RxDashboard', title: 'Dashboard', index: 1 },
    { link: '/admin-orders', icon: 'FiShoppingBag', title: 'All Orders', index: 2 },
    { link: '/admin-sellers', icon: 'GrWorkshop', title: 'All Sellers', index: 3 },
    { link: '/admin-users', icon: 'HiOutlineUserGroup', title: 'All Users', index: 4 },
    { link: '/admin-products', icon: 'BsHandbag', title: 'All Products', index: 5 },
    { link: '/admin-events', icon: 'MdOutlineLocalOffer', title: 'All Events', index: 6 },
    { link: '/admin-withdraw-request', icon: 'CiMoneyBill', title: 'Withdraw Request', index: 7 },
    { link: '/profile', icon: 'AiOutlineSetting', title: 'Settings', index: 8 },
  ];
}

@Component({
  selector: 'app-dashboard-side-bar',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10">
    @for (item of items; track item.index) {
      <div class="w-full flex items-center p-4"><a [routerLink]="item.link" class="w-full flex items-center">
        <app-icon [name]="item.icon" [size]="30" [color]="active === item.index ? 'crimson' : '#555'" />
        <h5 class="hidden 800px:block pl-2 text-[18px] font-[400] {{ active === item.index ? 'text-[crimson]' : 'text-[#555]' }}">{{ item.title }}</h5>
      </a></div>
    }
  </div>`,
})
export class DashboardSideBarComponent {
  @Input() active?: number;
  items: Item[] = [
    { link: '/dashboard', icon: 'RxDashboard', title: 'Dashboard', index: 1 },
    { link: '/dashboard-orders', icon: 'FiShoppingBag', title: 'All Orders', index: 2 },
    { link: '/dashboard-products', icon: 'FiPackage', title: 'All Products', index: 3 },
    { link: '/dashboard-create-product', icon: 'AiOutlineFolderAdd', title: 'Create Product', index: 4 },
    { link: '/dashboard-events', icon: 'MdOutlineLocalOffer', title: 'All Events', index: 5 },
    { link: '/dashboard-create-event', icon: 'VscNewFile', title: 'Create Event', index: 6 },
    { link: '/dashboard-withdraw-money', icon: 'CiMoneyBill', title: 'Withdraw Money', index: 7 },
    { link: '/dashboard-messages', icon: 'BiMessageSquareDetail', title: 'Shop Inbox', index: 8 },
    { link: '/dashboard-coupouns', icon: 'AiOutlineGift', title: 'Discount Codes', index: 9 },
    { link: '/dashboard-refunds', icon: 'HiOutlineReceiptRefund', title: 'Refunds', index: 10 },
    { link: '/settings', icon: 'CiSettings', title: 'Settings', index: 11 },
  ];
}
