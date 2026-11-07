import { Component } from '@angular/core';
import { AdminHeaderComponent } from '../components/layout/headers';
import { AdminSideBarComponent } from '../components/layout/sidebars';
import { AllProductsAdminComponent } from '../components/admin/lists';

@Component({ selector: 'app-admin-dashboard-products-page', standalone: true, imports: [AdminHeaderComponent, AdminSideBarComponent, AllProductsAdminComponent],
  template: `<div><app-admin-header /><div class="w-full flex"><div class="flex items-start justify-between w-full">
    <div class="w-[80px] 800px:w-[330px]"><app-admin-side-bar [active]="5" /></div><app-all-products-admin /></div></div></div>` })
export class AdminDashboardProductsPageComponent {}
