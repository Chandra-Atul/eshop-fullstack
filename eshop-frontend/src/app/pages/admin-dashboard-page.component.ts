import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../components/layout/headers';
import { AdminSideBarComponent } from '../components/layout/sidebars';
import { AdminDashboardMainComponent } from '../components/admin/admin-dashboard-main.component';

@Component({ selector: 'app-admin-dashboard-page', standalone: true, imports: [AdminHeaderComponent, AdminSideBarComponent, AdminDashboardMainComponent],
  template: `<div><app-admin-header /><div class="w-full flex"><div class="flex items-start justify-between w-full">
    <div class="w-[80px] 800px:w-[330px]"><app-admin-side-bar [active]="1" /></div><app-admin-dashboard-main /></div></div></div>` })
export class AdminDashboardPageComponent {}
