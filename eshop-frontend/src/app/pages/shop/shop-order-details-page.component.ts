import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { FooterComponent } from '../../components/layout/footer.component';
import { ShopOrderDetailsComponent } from '../../components/shop/order-details.component';


@Component({ selector: 'app-shop-order-details-page', standalone: true, imports: [DashboardHeaderComponent, FooterComponent, ShopOrderDetailsComponent], template: `<div><app-dashboard-header /><app-shop-order-details /><app-footer /></div>` })
export class ShopOrderDetailsPageComponent {}
