import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { WithdrawMoneyComponent } from '../../components/shop/withdraw-money.component';


@Component({ selector: 'app-shop-withdraw-money-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, WithdrawMoneyComponent], template: `<div><app-dashboard-header /><div class="flex items-start justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="7" /></div><app-withdraw-money /></div></div>` })
export class ShopWithDrawMoneyPageComponent {}
