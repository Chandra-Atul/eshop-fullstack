import { Component } from '@angular/core';
import { CheckoutStepsComponent } from '../components/checkout/checkout-steps.component';
import { FooterComponent } from '../components/layout/footer.component';
import { HeaderComponent } from '../components/layout/header.component';
import { PaymentComponent } from '../components/payment/payment.component';

@Component({ selector: 'app-payment-page', standalone: true, imports: [HeaderComponent, FooterComponent, CheckoutStepsComponent, PaymentComponent],
  template: `<div class="w-full min-h-screen bg-[#f6f9fc]"><app-header /><br /><br /><app-checkout-steps [active]="2" /><app-payment /><br /><br /><app-footer /></div>` })
export class PaymentPageComponent {}
