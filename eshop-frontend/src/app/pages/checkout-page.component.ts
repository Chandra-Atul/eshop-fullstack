import { Component } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { CheckoutStepsComponent } from '../components/checkout/checkout-steps.component';
import { CheckoutComponent } from '../components/checkout/checkout.component';

@Component({ selector: 'app-checkout-page', standalone: true, imports: [HeaderComponent, FooterComponent, CheckoutStepsComponent, CheckoutComponent],
  template: `<div><app-header /><br /><br /><app-checkout-steps [active]="1" /><app-checkout /><br /><br /><app-footer /></div>` })
export class CheckoutPageComponent {}
