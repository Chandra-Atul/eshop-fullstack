import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { AllCouponsComponent } from '../../components/shop/catalogue-lists';


@Component({ selector: 'app-shop-all-coupons-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, AllCouponsComponent], template: `<div><app-dashboard-header /><div class="flex justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="9" /></div><div class="w-full justify-center flex"><app-all-coupons /></div></div></div>` })
export class ShopAllCouponsPageComponent {}
