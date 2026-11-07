import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { DashboardHeroComponent } from '../../components/shop/shop-data';


@Component({ selector: 'app-shop-dashboard-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, DashboardHeroComponent], template: `<div><app-dashboard-header /><div class="flex items-start justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="1" /></div><app-dashboard-hero /></div></div>` })
export class ShopDashboardPageComponent {}
