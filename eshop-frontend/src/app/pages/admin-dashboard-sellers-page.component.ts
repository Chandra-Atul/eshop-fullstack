import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../components/layout/headers';
import { AdminSideBarComponent } from '../components/layout/sidebars';
import { AllSellersComponent } from '../components/admin/lists';

@Component({ selector: 'app-admin-dashboard-sellers-page', standalone: true, imports: [AdminHeaderComponent, AdminSideBarComponent, AllSellersComponent],
  template: `<div><app-admin-header /><div class="w-full flex"><div class="flex items-start justify-between w-full">
    <div class="w-[80px] 800px:w-[330px]"><app-admin-side-bar [active]="3" /></div><app-all-sellers /></div></div></div>` })
export class AdminDashboardSellersPageComponent {}
