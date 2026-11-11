import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { CartStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 transition-all hover:shadow-md my-8">
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <!-- Left: Image -->
        <div class="lg:col-span-5 flex justify-center items-center bg-gray-50 rounded-xl p-4 overflow-hidden max-h-[380px]">
          <img
            [src]="eventImage"
            alt="{{ data?.name }}"
            class="w-full h-[320px] object-contain transition-transform duration-300 hover:scale-105"
            (error)="handleImageError($event)"
          />
        </div>

        <!-- Right: Info -->
        <div class="lg:col-span-7 flex flex-col justify-center">
          
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5"></span> Limited Time Deal
            </span>
            <span class="text-xs text-gray-400 font-medium">{{ data?.sold_out || 0 }} sold</span>
          </div>

          <h2 class="text-xl lg:text-2xl font-bold text-gray-900 leading-snug line-clamp-2">
            {{ data?.name }}
          </h2>

          <p class="text-sm text-gray-500 mt-2.5 line-clamp-3 leading-relaxed">
            {{ data?.description }}
          </p>

          <!-- Pricing: Original Price first, Discount % Badge, then Deal Price -->
          <div class="my-4 py-3 border-y border-gray-100">
            <div class="flex items-center gap-3 flex-wrap">
              <!-- 1. Original Price First -->
              <span class="text-lg text-gray-400 line-through font-medium">
                ₹ {{ displayOriginalPrice.toFixed(2) }}
              </span>

              <!-- 2. Discount Percentage Badge -->
              <span class="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                -{{ discountPercentage }}% OFF
              </span>

              <!-- 3. Final Deal Price -->
              <span class="text-3xl font-extrabold text-[#e44343] font-Roboto">
                ₹ {{ displayDealPrice.toFixed(2) }}
              </span>
            </div>

            <p class="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
              Save ₹ {{ (displayOriginalPrice - displayDealPrice).toFixed(2) }} instantly during this event!
            </p>
          </div>

          <!-- Countdown / Status Timer -->
          <div class="my-2 p-3 bg-red-50 border border-red-100 rounded-xl inline-flex items-center gap-3 w-fit">
            <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
              ⏱
            </div>
            <div>
              <p class="text-xs text-red-500 font-medium">Event Status</p>
              <p class="text-sm font-semibold text-red-700">
                {{ isExpired ? "Event Ended" : "Limited Stock Available" }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 mt-6">
            <a
              [routerLink]="['/product', eventId]"
              [queryParams]="{ isEvent: true }"
              class="inline-flex items-center justify-center px-6 h-[46px] rounded-xl bg-gray-900 hover:bg-black text-white font-medium text-sm transition-colors shadow-sm"
            >
              See Details
            </a>

            <button
              type="button"
              (click)="addToCartHandler()"
              class="inline-flex items-center justify-center gap-2 px-6 h-[46px] rounded-xl bg-[#e44343] hover:bg-[#d02222] text-white font-medium text-sm transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <app-icon name="AiOutlineShoppingCart" [size]="18" />
              Add to cart
            </button>
          </div>

        </div>

      </div>
    </div>
  `,
})
export class EventCardComponent {
  @Input() data: any;

  private cartStore = inject(CartStore);
  private toast = inject(ToastService);

  get eventId(): string {
    return String(this.data?._id || this.data?.id || '');
  }

  get eventImage(): string {
    const first = this.data?.images?.[0];
    if (!first) return 'https://placehold.co/400x320?text=No+Image';
    return typeof first === 'string' ? first : (first?.url || 'https://placehold.co/400x320?text=No+Image');
  }

  get displayDealPrice(): number {
    return Number(
        this.data?.discountPrice ??
        this.data?.discount_price ??
        this.data?.price ??
        0
    );
  }

  get displayOriginalPrice(): number {
    // Check all possible casing variants sent by Spring Boot / Jackson
    const raw = Number(
        this.data?.originalPrice ??
        this.data?.original_price ??
        this.data?.OriginalPrice ??
        0
    );

    // If database value is present (8999), use it directly
    if (raw > 0) {
      return raw;
    }

    // Only fallback if the database field is completely null or 0
    return this.displayDealPrice > 0 ? Math.round(this.displayDealPrice * 1.45) : 0;
  }

  get hasDiscount(): boolean {
    return this.displayOriginalPrice > this.displayDealPrice && this.displayDealPrice > 0;
  }

  get discountPercentage(): number {
    if (this.hasDiscount) {
      return Math.round(
          ((this.displayOriginalPrice - this.displayDealPrice) / this.displayOriginalPrice) * 100
      );
    }
    return 0;
  }

  get isExpired(): boolean {
    if (!this.data?.finish_Date && !this.data?.endDate) return false;
    const end = new Date(this.data?.finish_Date || this.data?.endDate).getTime();
    return end < Date.now();
  }

  addToCartHandler() {
    const id = this.eventId;
    if (!id) return;

    this.cartStore.addTocart(
        {
          ...this.data,
          _id: id,
          id: id,
        },
        1
    );
    this.toast.success('Event item added to cart successfully!');
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x320?text=No+Image';
  }
}