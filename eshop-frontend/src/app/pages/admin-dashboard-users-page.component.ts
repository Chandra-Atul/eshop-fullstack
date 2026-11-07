import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../components/layout/headers';
import { AdminSideBarComponent } from '../components/layout/sidebars';
import { AllUsersComponent } from '../components/admin/lists';

@Component({ selector: 'app-admin-dashboard-users-page', standalone: true, imports: [AdminHeaderComponent, AdminSideBarComponent, AllUsersComponent],
  template: `<div><app-admin-header /><div class="w-full flex"><div class="flex items-start justify-between w-full">
    <div class="w-[80px] 800px:w-[330px]"><app-admin-side-bar [active]="4" /></div><app-all-users /></div></div></div>` })
export class AdminDashboardUsersPageComponent {}
