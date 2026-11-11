import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { categoriesData } from '../../static/data';
import { styles } from '../../styles';

@Component({
  selector: 'app-categories',
  standalone: true,
  template: `
    <!-- 1. Value Proposition Strip -->
    <section class="{{ styles.section }} my-10 hidden sm:block">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-xs">
        @for (item of features; track item.id) {
          <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group">
            <div class="w-12 h-12 rounded-xl {{ item.bgClass }} {{ item.textClass }} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              @switch (item.id) {
                @case (1) {
                  <!-- Free Shipping: Truck -->
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8h4.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-10 0a2 2 0 104 0" />
                  </svg>
                }
                @case (2) {
                  <!-- Daily Offers: Sparkles / Gift -->
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                }
                @case (3) {
                  <!-- Affordable Prices: Discount Tag -->
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                @default {
                  <!-- Secure Payments: Shield Check -->
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
              }
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-gray-900 group-hover:text-[#4f46e5] transition-colors truncate">
                {{ item.title }}
              </h3>
              <p class="text-xs text-gray-500 mt-0.5 leading-snug">
                {{ item.description }}
              </p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- 2. Categories Grid Section -->
    <section class="{{ styles.section }} mb-16" id="categories">
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        
        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-100 gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
              <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Popular Departments</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Explore Top Categories
            </h2>
          </div>
          <p class="text-xs text-gray-500 font-medium">Click on any category to view collections</p>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          @for (cat of categoriesData; track cat.id) {
            <div
              (click)="handleSubmit(cat)"
              class="group relative bg-gray-50/70 hover:bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200/80 hover:shadow-md transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer overflow-hidden hover:-translate-y-1"
            >
              <!-- Image Container -->
              <div class="w-full h-24 flex items-center justify-center p-2 mb-3">
                <img
                  [src]="cat.image_Url"
                  [alt]="cat.title"
                  class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-2xs"
                  (error)="handleImageError($event)"
                />
              </div>

              <!-- Title & Arrow -->
              <div class="w-full pt-2 border-t border-gray-200/50 flex items-center justify-between">
                <h5 class="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#4f46e5] transition-colors truncate text-left">
                  {{ cat.title }}
                </h5>
                <span class="w-6 h-6 rounded-full bg-white group-hover:bg-[#4f46e5] text-gray-400 group-hover:text-white flex items-center justify-center shadow-2xs transition-colors shrink-0 ml-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          }
        </div>

      </div>
    </section>
  `,
})
export class CategoriesComponent {
  private router = inject(Router);

  categoriesData = categoriesData;
  styles = styles;

  features = [
    {
      id: 1,
      title: 'Free Shipping',
      description: 'On all orders above ₹999',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-600',
    },
    {
      id: 2,
      title: 'Daily Surprise Offers',
      description: 'Save up to 40% off',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-600',
    },
    {
      id: 3,
      title: 'Affordable Prices',
      description: 'Direct factory pricing',
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-600',
    },
    {
      id: 4,
      title: 'Secure Payments',
      description: '100% protected transactions',
      bgClass: 'bg-indigo-50',
      textClass: 'text-indigo-600',
    },
  ];

  handleSubmit(cat: any) {
    this.router.navigate(['/products'], { queryParams: { category: cat.title } });
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Category';
  }
}