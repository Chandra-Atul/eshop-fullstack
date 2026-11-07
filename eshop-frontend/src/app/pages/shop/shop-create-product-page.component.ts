import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { CreateProductComponent } from '../../components/shop/forms';


@Component({ selector: 'app-shop-create-product-page', standalone: true, imports: [DashboardHeaderComponent, DashboardSideBarComponent, CreateProductComponent], template: `<div><app-dashboard-header /><div class="flex items-center justify-between w-full"><div class="w-[80px] 800px:w-[330px]"><app-dashboard-side-bar [active]="4" /></div><div class="w-full justify-center flex"><app-create-product /></div></div></div>` })
export class ShopCreateProductPageComponent {}
