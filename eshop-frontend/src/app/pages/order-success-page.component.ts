import { Component } from '@angular/core';
import { FooterComponent } from '../components/layout/footer.component';
import { HeaderComponent } from '../components/layout/header.component';
import { LottieComponent } from '../shared/lottie.component';

@Component({ selector: 'app-order-success-page', standalone: true, imports: [HeaderComponent, FooterComponent, LottieComponent],
  template: `<div><app-header /><div>
    <app-lottie path="assets/animations/107043-success.json" [width]="300" [height]="300" [loop]="false" [autoplay]="true" />
    <h5 class="text-center mb-14 text-[25px] text-[#000000a1]">Your order is successful 😍</h5><br /><br /></div><app-footer /></div>` })
export class OrderSuccessPageComponent {}
