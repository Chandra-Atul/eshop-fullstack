import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { styles } from '../../styles';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      class="relative min-h-[75vh] 800px:min-h-[82vh] w-full bg-cover bg-center flex items-center bg-gray-50 overflow-hidden"
      style="background-image: url('https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg');"
    >
      <!-- Subtle frosted gradient overlay for improved text legibility -->
      <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent 800px:via-white/70"></div>

      <div class="{{ styles.section }} relative z-10 w-[92%] 800px:w-[65%] py-12 800px:py-20">
        
        <!-- Collection Tag -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 mb-6 backdrop-blur-xs">
          <span class="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse"></span>
          <span class="text-xs font-bold uppercase tracking-wider text-[#4f46e5]">
            Curated Interior Season 2026
          </span>
        </div>

        <!-- Heading with Gradient Accent -->
        <h1 class="text-3xl sm:text-5xl 800px:text-6xl font-black text-gray-900 leading-[1.15] tracking-tight max-w-[680px]">
          Best Collection For
          <span class="bg-gradient-to-r from-[#1e1b4b] via-[#4f46e5] to-[#f43f5e] bg-clip-text text-transparent">
            Home Decoration
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="pt-5 text-sm sm:text-base 800px:text-lg text-gray-600 max-w-[560px] leading-relaxed font-normal">
          Discover handpicked lifestyle essentials, artisan home accents, and modern decor crafted to elevate every corner of your living space.
        </p>

        <!-- CTA Buttons -->
        <div class="pt-8 flex flex-wrap items-center gap-4">
          <a
            routerLink="/products"
            class="h-12 px-8 rounded-full bg-gradient-to-r from-[#1e1b4b] to-[#4f46e5] hover:from-[#110f2c] hover:to-[#4338ca] text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center shadow-lg shadow-indigo-950/20 hover:shadow-indigo-950/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Shop Now</span>
            <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          <a
            routerLink="/best-selling"
            class="h-12 px-7 rounded-full bg-white/90 hover:bg-white text-gray-800 font-semibold text-sm sm:text-base inline-flex items-center justify-center border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-xs"
          >
            Explore Deals
          </a>
        </div>

        <!-- Trust Highlights -->
        <div class="pt-10 mt-10 border-t border-gray-200/80 flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-600 font-medium">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">✓</div>
            <span>Free Shipping Above ₹999</span>
          </div>

          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">★</div>
            <span>4.9/5 Rating (12k+ Reviews)</span>
          </div>

          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">🛡</div>
            <span>100% Secure Checkout</span>
          </div>
        </div>

      </div>
    </div>  
  `,
})
export class HeroComponent {
  styles = styles;
}