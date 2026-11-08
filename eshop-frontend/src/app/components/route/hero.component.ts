import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { styles } from '../../styles';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat bg-cover bg-center flex items-center bg-gray-100"
      style="background-image: url('https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg');"
    >
      <div class="{{ styles.section }} w-[90%] 800px:w-[60%] py-10">
        <h1 class="text-[32px] sm:text-[42px] 800px:text-[60px] leading-[1.2] text-[#3d3a3a] font-[700] capitalize max-w-[650px]">
          Best Collection for Home Decoration
        </h1>

        <p class="pt-5 text-[15px] sm:text-[16px] font-[Poppins] font-[400] text-[#000000ba] max-w-[550px] leading-relaxed">
          Discover handpicked lifestyle essentials, artisan home accents, and modern decor crafted to elevate every corner of your living space.
        </p>

        <a
          routerLink="/products"
          class="{{ styles.button }} mt-6 inline-flex items-center justify-center transition-transform active:scale-95 hover:opacity-95"
        >
          <span class="text-[#fff] font-[Poppins] text-[18px] font-medium">Shop Now</span>
        </a>
      </div>
    </div>
  `,
})
export class HeroComponent {
  styles = styles;
}