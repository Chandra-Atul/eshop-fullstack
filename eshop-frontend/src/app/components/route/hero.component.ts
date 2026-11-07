import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { styles } from '../../styles';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-cover {{ styles.noramlFlex }}"
    style="background-image:url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)">
    <div class="{{ styles.section }} w-[90%] 800px:w-[60%]">
      <h1 class="text-[35px] leading-[1.2] 800px:text-[60px] text-[#3d3a3a] font-[600] capitalize">Best Collection for <br /> home Decoration</h1>
      <p class="pt-5 text-[16px] font-[Poppins] font-[400] text-[#000000ba]">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Beatae,
        assumenda? Quisquam itaque <br /> exercitationem labore vel, dolore quidem asperiores, laudantium temporibus soluta optio consequatur
        <br /> aliquam deserunt officia. Dolorum saepe nulla provident.</p>
      <a routerLink="/products" class="inline-block"><div class="{{ styles.button }} mt-5"><span class="text-[#fff] font-[Poppins] text-[18px]">Shop Now</span></div></a>
    </div>
  </div>`,
})
export class HeroComponent { styles = styles; }
