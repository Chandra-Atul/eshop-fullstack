import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { InboxComponent } from '../../components/shop/inbox.component';


@Component({ selector: 'app-shop-inbox-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, InboxComponent], template: `<div><app-dashboard-header /><div class="flex items-start justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="8" /></div><app-inbox mode="seller" /></div></div>` })
export class ShopInboxPageComponent {}
