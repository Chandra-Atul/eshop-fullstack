import { Component } from '@angular/core';
import { ShopSettingsComponent } from '../../components/shop/shop-settings.component';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';


@Component({ selector: 'app-shop-settings-page', standalone: true, imports: [ShopSettingsComponent, DashboardHeaderComponent, DashboardSideBarComponent], template: `<div><app-dashboard-header /><div class="flex items-start justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="11" /></div><app-shop-settings /></div></div>` })
export class ShopSettingsPageComponent {}
