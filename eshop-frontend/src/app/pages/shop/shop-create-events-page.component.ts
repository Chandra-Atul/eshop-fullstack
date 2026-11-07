import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { CreateEventComponent } from '../../components/shop/forms';


@Component({ selector: 'app-shop-create-events-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, CreateEventComponent], template: `<div><app-dashboard-header /><div class="flex items-center justify-between w-full"><div class="w-[330px]"><app-dashboard-side-bar [active]="6" /></div><div class="w-full justify-center flex"><app-create-event /></div></div></div>` })
export class ShopCreateEventsPageComponent {}
