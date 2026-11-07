import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { ShopAllRefundOrdersComponent } from '../../components/shop/order-lists';


@Component({ selector: 'app-shop-all-refunds-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, ShopAllRefundOrdersComponent], template: `<div><app-dashboard-header /><div class="flex justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="10" /></div><div class="w-full justify-center flex"><app-shop-all-refund-orders /></div></div></div>` })
export class ShopAllRefundsPageComponent {}
