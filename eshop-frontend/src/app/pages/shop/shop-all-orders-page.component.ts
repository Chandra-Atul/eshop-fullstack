import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { ShopAllOrdersComponent } from '../../components/shop/order-lists';


@Component({ selector: 'app-shop-all-orders-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, ShopAllOrdersComponent], template: `<div><app-dashboard-header /><div class="flex justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="2" /></div><div class="w-full justify-center flex"><app-shop-all-orders /></div></div></div>` })
export class ShopAllOrdersPageComponent {}
