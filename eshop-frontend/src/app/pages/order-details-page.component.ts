import { Component } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { UserOrderDetailsComponent } from '../components/user-order-details.component';

@Component({ selector: 'app-order-details-page', standalone: true, imports: [HeaderComponent, FooterComponent, UserOrderDetailsComponent],
  template: `<div><app-header /><app-user-order-details /><app-footer /></div>` })
export class OrderDetailsPageComponent {}
