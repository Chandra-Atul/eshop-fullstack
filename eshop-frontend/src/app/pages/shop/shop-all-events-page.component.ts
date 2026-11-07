import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { ShopAllEventsComponent } from '../../components/shop/catalogue-lists';


@Component({ selector: 'app-shop-all-events-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, ShopAllEventsComponent], template: `<div><app-dashboard-header /><div class="flex justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="5" /></div><div class="w-full justify-center flex"><app-shop-all-events /></div></div></div>` })
export class ShopAllEventsPageComponent {}
