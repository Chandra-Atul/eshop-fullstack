import { Component } from '@angular/core';
import { LottieComponent } from '../../shared/lottie.component';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [LottieComponent],
  template: `<div class="w-full h-screen flex items-center justify-center">
    <app-lottie path="assets/animations/24151-ecommerce-animation.json" [width]="300" [height]="300" [loop]="true" [autoplay]="true" />
  </div>`,
})
export class LoaderComponent {}
