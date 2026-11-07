import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { UserStore } from '../../core/state';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="w-full bg-white shadow-sm rounded-[10px] p-4 pt-8">
    @for (item of items; track item.index) {
      <div class="flex items-center cursor-pointer w-full mb-8" (click)="selectItem(item)">
        <app-icon [name]="item.icon" [size]="20" [color]="active === item.index ? 'red' : ''" />
        <span class="pl-3 {{ active === item.index ? 'text-[red]' : '' }} 800px:block hidden">{{ item.title }}</span>
      </div>
    }
    @if (user() && user()?.role === 'Admin') {
      <a routerLink="/admin/dashboard"><div class="flex items-center cursor-pointer w-full mb-8" (click)="activeChange.emit(8)">
        <app-icon name="MdOutlineAdminPanelSettings" [size]="20" [color]="active === 7 ? 'red' : ''" />
        <span class="pl-3 {{ active === 8 ? 'text-[red]' : '' }} 800px:block hidden">Admin Dashboard</span></div></a>
    }
    <div class="single_item flex items-center cursor-pointer w-full mb-8" (click)="logoutHandler()">
      <app-icon name="AiOutlineLogin" [size]="20" [color]="active === 8 ? 'red' : ''" />
      <span class="pl-3 {{ active === 8 ? 'text-[red]' : '' }} 800px:block hidden">Log out</span></div>
  </div>`,
})
export class ProfileSidebarComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  @Input() active = 1;
  @Output() activeChange = new EventEmitter<number>();
  user = this.userStore.user;
  items = [
    { index: 1, icon: 'RxPerson', title: 'Profile' },
    { index: 2, icon: 'HiOutlineShoppingBag', title: 'Orders' },
    { index: 3, icon: 'HiOutlineReceiptRefund', title: 'Refunds' },
    { index: 4, icon: 'AiOutlineMessage', title: 'Inbox' },
    { index: 5, icon: 'MdOutlineTrackChanges', title: 'Track Order' },
    { index: 6, icon: 'RiLockPasswordLine', title: 'Change Password' },
    { index: 7, icon: 'TbAddressBook', title: 'Address' },
  ];
  selectItem(item: any) {
    this.activeChange.emit(item.index);
    if (item.index === 4) this.router.navigate(['/inbox']);
  }
  async logoutHandler() {
    try { const res: any = await this.api.get(`${server}/user/logout`, true); this.toast.success(res.message); window.location.reload(); this.router.navigate(['/login']); }
    catch (error) { console.log(error); }
  }
}
