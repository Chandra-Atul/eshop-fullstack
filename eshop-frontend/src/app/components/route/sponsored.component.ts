import { Component } from '@angular/core';
import { styles } from '../../styles';

@Component({
  selector: 'app-sponsored',
  standalone: true,
  template: `
    <section class="{{ styles.section }} my-12 hidden sm:block">
      <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs">
        
        <!-- Header Label -->
        <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">
              Trusted Global Brands
            </span>
          </div>
          <span class="text-xs font-medium text-gray-400">
            100% Genuine Authorized Partners
          </span>
        </div>

        <!-- Brands Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center justify-items-center gap-8 sm:gap-12">
          @for (brand of brands; track brand.name) {
            <div 
              class="group flex items-center justify-center p-3 h-16 w-36 rounded-xl hover:bg-gray-50/80 transition-all duration-300"
              [title]="brand.name"
            >
              <img 
                [src]="brand.imageUrl" 
                [alt]="brand.name" 
                class="max-h-8 max-w-[120px] object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 cursor-pointer"
                (error)="handleImageError($event, brand.name)"
              />
            </div>
          }
        </div>

      </div>
    </section>
  `,
})
export class SponsoredComponent {
  styles = styles;

  brands = [
    {
      name: 'Sony',
      imageUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png',
    },
    {
      name: 'Dell',
      imageUrl: 'https://logos-world.net/wp-content/uploads/2020/08/Dell-Logo-1989-2016.png',
    },
    {
      name: 'Apple',
      imageUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png',
    },
    {
      name: 'Microsoft',
      imageUrl: 'https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png',
    },
    {
      name: 'Samsung',
      imageUrl: 'https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png',
    },
  ];

  handleImageError(event: Event, name: string) {
    (event.target as HTMLImageElement).src = `https://placehold.co/120x40?text=${name}`;
  }
}