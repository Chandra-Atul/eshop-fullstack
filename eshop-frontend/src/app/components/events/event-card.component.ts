import { Component, Input, computed, inject } from '@angular/core';
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
        
        <!-- Left Column: Featured Event Image -->
        <div class="lg:col-span-5 flex justify-center items-center bg-gray-50 rounded-xl p-4 overflow-hidden max-h-[380px]">
          <img
            [src]="eventImage"
            alt="{{ data?.name }}"
            class="w-full h-[320px] object-contain transition-transform duration-300 hover:scale-105"
            (error)="handleImageError($event)"
          />
        </div>

        <!-- Right Column: Event Info & Controls -->
        <div class="lg:col-span-7 flex flex-col justify-center">
          
          <!-- Badge Strip -->
          <div class="flex items-center gap-3 mb-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5"></span> Limited Time Deal
            </span>
            <span class="text-xs text-gray-400 font-medium">{{ data?.sold_out || 0 }} sold</span>
          </div>

          <!-- Title -->
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900 leading-snug line-clamp-2">
            {{ data?.name }}
          </h2>

          <!-- Description -->
          <p class="text-sm text-gray-500 mt-2.5 line-clamp-3 leading-relaxed">
            {{ data?.description }}
          </p>

          <!-- Pricing -->
          <div class="flex items-baseline gap-3 my-4">
            <span class="text-2xl font-extrabold text-red-600 font-Roboto">
              US$ {{ data?.discountPrice ?? data?.price ?? 0 }}
            </span>
            @if (data?.originalPrice && data?.originalPrice > (data?.discountPrice ?? 0)) {
              <span class="text-base text-gray-400 line-through">
                US$ {{ data?.originalPrice }}
              </span>
            }
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

          <!-- Action Buttons -->
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

  get isExpired(): boolean {
    if (!this.data?.finish_Date && !this.data?.endDate) return true;
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