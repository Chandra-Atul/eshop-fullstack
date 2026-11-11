import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore, UserStore, WishlistStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { ApiService } from '../../core/api.service';
import { server } from '../../config';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-details-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    @if (data) {
      <div 
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
        (click)="onBackdropClick($event)"
      >
        <div 
          class="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-100 relative p-6 sm:p-8"
          (click)="$event.stopPropagation()"
        >
          <!-- Close Button -->
          <button
            type="button"
            (click)="closed.emit(false)"
            class="absolute right-5 top-5 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Quick View"
          >
            <app-icon name="RxCross1" [size]="18" />
          </button>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            <!-- Left: Visual Column -->
            <div class="flex flex-col gap-4">
              <div class="relative bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-[300px] max-h-[360px] overflow-hidden">
                <!-- Stock / Discount Badge -->
                <div class="absolute top-3 left-3 flex flex-col gap-1 z-10">
                  @if (discountPercentage > 0) {
                    <span class="px-2.5 py-1 bg-[#f63b60] text-white text-[11px] font-extrabold rounded-md shadow-xs">
                      SAVE {{ discountPercentage }}%
                    </span>
                  }
                  @if (isStockAvailable) {
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-md">
                      In Stock
                    </span>
                  } @else {
                    <span class="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded-md">
                      Out of Stock
                    </span>
                  }
                </div>

                <img 
                  [src]="mainImage" 
                  [alt]="data.name" 
                  class="w-full h-full max-h-[280px] object-contain transition-transform duration-300 hover:scale-105"
                  (error)="handleImageError($event)"
                />
              </div>

              <!-- Shop Card Strip -->
              <div class="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <a [routerLink]="['/shop/preview', shopId]" (click)="closed.emit(false)" class="flex items-center gap-3 group">
                  <img 
                    [src]="data?.shop?.avatar?.url || 'https://placehold.co/50x50?text=S'" 
                    alt="" 
                    class="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-2xs" 
                  />
                  <div>
                    <h3 class="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {{ data.shop?.name || 'Verified Merchant' }}
                    </h3>
                    <h5 class="text-xs text-gray-500 font-medium">
                      ★ {{ (data?.ratings || 5) }}/5 Ratings
                    </h5>
                  </div>
                </a>

                <button
                  type="button"
                  (click)="handleMessageSubmit()"
                  class="px-3 py-1.5 bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <app-icon name="AiOutlineMessage" [size]="14" />
                  Chat
                </button>
              </div>

              <!-- Sold Count -->
              <div class="text-xs text-gray-500 font-medium px-1 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>{{ data?.sold_out || 0 }} units sold so far</span>
              </div>
            </div>

            <!-- Right: Product Info & Actions -->
            <div class="flex flex-col justify-between h-full">
              <div>
                <a 
                  [routerLink]="['/product', productId]" 
                  (click)="closed.emit(false)"
                  class="text-xl font-extrabold text-gray-900 hover:text-[#f63b60] transition-colors line-clamp-2 leading-snug"
                >
                  {{ data.name }}
                </a>

                <p class="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                  {{ data.description }}
                </p>

                <!-- Price Row -->
                <div class="py-4 my-2 border-y border-gray-100">
                  <div class="flex items-baseline gap-3">
                    <span class="text-2xl sm:text-3xl font-extrabold text-[#f63b60]">
                      ₹{{ currentPrice.toFixed(2) }}
                    </span>
                    @if (data.originalPrice && data.originalPrice > currentPrice) {
                      <span class="text-base text-gray-400 line-through font-medium">
                        ₹{{ data.originalPrice }}
                      </span>
                      <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Save ₹{{ (data.originalPrice - currentPrice).toFixed(2) }}
                      </span>
                    }
                  </div>
                  <p class="text-[11px] text-gray-400 mt-1">Inclusive of all local taxes</p>
                </div>
              </div>

              <!-- Quantity Selector & Actions -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</span>
                  <span class="text-xs text-gray-500">
                    Stock available: <strong class="text-gray-800">{{ currentStock }}</strong>
                  </span>
                </div>

                <div class="flex items-center justify-between gap-4 mb-5">
                  <!-- Stepper -->
                  <div class="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      type="button"
                      (click)="decrementCount()"
                      [disabled]="count() <= 1"
                      class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                    >
                      -
                    </button>
                    <span class="w-12 text-center text-sm font-bold text-gray-900 select-none">
                      {{ count() }}
                    </span>
                    <button
                      type="button"
                      (click)="incrementCount()"
                      [disabled]="count() >= currentStock"
                      class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  <!-- Wishlist Heart -->
                  <button
                    type="button"
                    (click)="click() ? removeFromWishlistHandler() : addToWishlistHandler()"
                    class="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                    [title]="click() ? 'Remove from wishlist' : 'Add to wishlist'"
                  >
                    @if (click()) {
                      <app-icon name="AiFillHeart" [size]="22" color="#f63b60" />
                    } @else {
                      <app-icon name="AiOutlineHeart" [size]="22" color="#64748b" />
                    }
                  </button>
                </div>

                <!-- Add to Cart CTA -->
                <button
                  type="button"
                  (click)="addToCartHandler()"
                  [disabled]="!isStockAvailable"
                  class="w-full h-12 bg-[#f63b60] hover:bg-[#e02d51] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <app-icon name="AiOutlineShoppingCart" [size]="18" />
                  Add to Cart • ₹{{ (currentPrice * count()).toFixed(2) }}
                </button>

                <div class="text-center mt-3">
                  <a 
                    [routerLink]="['/product', productId]" 
                    (click)="closed.emit(false)"
                    class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Full Product Details →
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    }
  `,
})
export class ProductDetailsCardComponent {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private userStore = inject(UserStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @Input() data!: Product | any;
  @Output() closed = new EventEmitter<boolean>();

  styles = styles;
  count = signal(1);

  get productId(): string {
    return String(this.data?._id || this.data?.id || '');
  }

  get shopId(): string {
    return String(this.data?.shop?._id || this.data?.shop?.id || this.data?.shopId || '1');
  }

  get currentPrice(): number {
    return Number(this.data?.discountPrice ?? this.data?.price ?? 0);
  }

  get currentStock(): number {
    return Number(this.data?.stock ?? this.data?.Stock ?? 0);
  }

  get isStockAvailable(): boolean {
    return this.currentStock > 0;
  }

  get discountPercentage(): number {
    const orig = Number(this.data?.originalPrice);
    if (orig && orig > this.currentPrice) {
      return Math.round(((orig - this.currentPrice) / orig) * 100);
    }
    return 0;
  }

  get mainImage(): string {
    const firstImg = this.data?.images?.[0];
    if (!firstImg) return 'https://placehold.co/400x400?text=No+Image';
    return typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://placehold.co/400x400?text=No+Image');
  }

  click = computed(() => {
    const id = this.productId;
    if (!id) return false;
    return !!this.wishlistStore.wishlist().find((i: any) => String(i._id || i.id) === id);
  });

  onBackdropClick(event: MouseEvent) {
    this.closed.emit(false);
  }

  decrementCount() {
    if (this.count() > 1) {
      this.count.update(c => c - 1);
    }
  }

  incrementCount() {
    if (this.count() < this.currentStock) {
      this.count.update(c => c + 1);
    } else {
      this.toast.error('Maximum available stock reached');
    }
  }

  addToCartHandler() {
    const id = this.productId;
    if (!id) {
      this.toast.error('Product identifier not found');
      return;
    }

    if (this.currentStock < this.count()) {
      this.toast.error('Product stock limited!');
      return;
    }

    const cartList = this.cartStore.cart() || [];
    const existingIndex = cartList.findIndex((i: any) => String(i._id || i.id) === id);

    let updatedList: any[];

    if (existingIndex > -1) {
      const existingItem = cartList[existingIndex];
      const updatedItem = {
        ...existingItem,
        ...this.data,
        _id: id,
        id: id,
        qty: this.count(),
      };

      updatedList = [...cartList];
      updatedList[existingIndex] = updatedItem;
      this.toast.success(`Cart updated to ${this.count()} items!`);
    } else {
      const newItem = {
        ...this.data,
        _id: id,
        id: id,
        qty: this.count(),
      };

      updatedList = [...cartList, newItem];
      this.toast.success('Added to cart!');
    }

    this.cartStore.cart.set(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(updatedList));
    }
    this.closed.emit(false);
  }

  removeFromWishlistHandler() {
    const normalized = { ...this.data, _id: this.productId, id: this.productId };
    this.wishlistStore.removeFromWishlist(normalized);
    this.toast.success('Removed from wishlist');
  }

  addToWishlistHandler() {
    const normalized = { ...this.data, _id: this.productId, id: this.productId };
    this.wishlistStore.addToWishlist(normalized);
    this.toast.success('Added to wishlist');
  }

  async handleMessageSubmit() {
    const user: any = this.userStore.user();
    if (this.userStore.isAuthenticated()) {
      try {
        const userId = user?._id || user?.id || '';
        const res: any = await this.api.post(`${server}/conversation/create-new-conversation`, {
          groupTitle: this.productId + userId,
          userId: userId,
          sellerId: this.shopId,
        });
        this.closed.emit(false);
        this.router.navigateByUrl(`/inbox?${res.conversation._id || res.conversation.id}`);
      } catch (error) {
        this.toast.error(this.api.message(error));
      }
    } else {
      this.toast.error('Please login to send messages');
    }
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
  }
}