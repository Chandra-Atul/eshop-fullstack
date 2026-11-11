import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore, ProductStore, UserStore, WishlistStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { ApiService } from '../../core/api.service';
import { server } from '../../config';
import { Product } from '../../core/models';
import { RatingsComponent } from './ratings.component';

// ==========================================
// 1. PRODUCT DETAILS INFO TABS
// ==========================================
@Component({
  selector: 'app-product-details-info',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingsComponent],
  template: `
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-12">
      <!-- Tab Header Strip -->
      <div class="flex border-b border-gray-100 px-6 sm:px-8 bg-gray-50/60 gap-8">
        <button
          type="button"
          (click)="active.set(1)"
          class="py-4 text-sm sm:text-base font-semibold transition-all relative cursor-pointer"
          [class.text-[#f63b60]]="active() === 1"
          [class.text-gray-500]="active() !== 1"
        >
          Product Overview
          @if (active() === 1) {
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-[#f63b60] rounded-full"></span>
          }
        </button>

        <button
          type="button"
          (click)="active.set(2)"
          class="py-4 text-sm sm:text-base font-semibold transition-all relative cursor-pointer flex items-center gap-2"
          [class.text-[#f63b60]]="active() === 2"
          [class.text-gray-500]="active() !== 2"
        >
          Customer Reviews
          <span
            class="text-xs px-2 py-0.5 rounded-full font-bold"
            [class.bg-red-50]="active() === 2"
            [class.text-[#f63b60]]="active() === 2"
            [class.bg-gray-100]="active() !== 2"
            [class.text-gray-600]="active() !== 2"
          >
            {{ data?.reviews?.length || 0 }}
          </span>
          @if (active() === 2) {
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-[#f63b60] rounded-full"></span>
          }
        </button>

        <button
          type="button"
          (click)="active.set(3)"
          class="py-4 text-sm sm:text-base font-semibold transition-all relative cursor-pointer"
          [class.text-[#f63b60]]="active() === 3"
          [class.text-gray-500]="active() !== 3"
        >
          Seller Profile
          @if (active() === 3) {
            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-[#f63b60] rounded-full"></span>
          }
        </button>
      </div>

      <div class="p-6 sm:p-8 min-h-[260px]">
        <!-- Tab 1: Product Description -->
        @if (active() === 1) {
          <div class="max-w-4xl space-y-4">
            <h3 class="text-lg font-bold text-gray-900">About this product</h3>
            <p class="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
              {{ data?.description || 'No description provided for this product.' }}
            </p>
          </div>
        }

        <!-- Tab 2: Reviews -->
        @if (active() === 2) {
          <div class="max-w-4xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-xl mb-6">
              <div>
                <h4 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {{ averageRating }}
                  <span class="text-sm font-normal text-gray-500">out of 5 stars</span>
                </h4>
                <div class="mt-1 flex items-center gap-2">
                  <app-ratings [rating]="numericRating" />
                  <span class="text-xs text-gray-500 font-medium">({{ totalReviewsLength }} total ratings)</span>
                </div>
              </div>
            </div>

            <div class="space-y-4 divide-y divide-gray-100">
              @for (item of data?.reviews || []; track $index) {
                <div class="pt-4 first:pt-0">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="item?.user?.avatar?.url || 'https://placehold.co/40x40?text=U'"
                      alt=""
                      class="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h4 class="text-sm font-semibold text-gray-900">{{ item?.user?.name || 'Verified Buyer' }}</h4>
                      <div class="flex items-center gap-2 mt-0.5">
                        <app-ratings [rating]="item?.rating ?? 5" />
                        <span class="text-[11px] text-gray-400">Verified Purchase</span>
                      </div>
                    </div>
                  </div>
                  <p class="text-gray-700 text-sm mt-2.5 leading-relaxed pl-13">
                    {{ item?.comment || 'No written feedback provided.' }}
                  </p>
                </div>
              }

              @if (!data?.reviews || data.reviews.length === 0) {
                <div class="text-center py-10">
                  <div class="text-gray-300 mb-2">
                    <app-icon name="AiOutlineStar" [size]="36" class="mx-auto" />
                  </div>
                  <h5 class="text-gray-600 font-semibold text-sm">No Customer Reviews Yet</h5>
                  <p class="text-gray-400 text-xs mt-1">Be the first to review this product after purchase!</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Tab 3: Seller Information -->
        @if (active() === 3) {
          <div class="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <img
                  [src]="data?.shop?.avatar?.url || 'https://placehold.co/60x60?text=S'"
                  class="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                  alt=""
                />
                <div>
                  <h3 class="text-lg font-bold text-gray-900">{{ data?.shop?.name || 'Verified Store' }}</h3>
                  <div class="flex items-center gap-1.5 mt-0.5 text-xs text-emerald-600 font-semibold">
                    <app-icon name="AiOutlineCheckCircle" [size]="14" />
                    Verified Merchant
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Joined: {{ data?.shop?.createdAt?.slice(0, 10) || 'Recently' }}</p>
                </div>
              </div>
              <p class="text-gray-600 text-sm leading-relaxed">
                {{ data?.shop?.description || 'Quality-oriented merchant offering authenticated products backed by fast support and customer satisfaction.' }}
              </p>
            </div>

            <div class="bg-gray-50/80 p-5 rounded-xl border border-gray-100 space-y-3">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Merchant Performance</h4>
              <div class="flex justify-between text-sm py-1 border-b border-gray-200/60">
                <span class="text-gray-500">Shop Rating</span>
                <span class="font-bold text-gray-900">{{ averageRating }} / 5.0</span>
              </div>
              <div class="flex justify-between text-sm py-1 border-b border-gray-200/60">
                <span class="text-gray-500">Listed Products</span>
                <span class="font-bold text-gray-900">{{ products ? products.length : 0 }}</span>
              </div>
              <div class="flex justify-between text-sm py-1 border-b border-gray-200/60">
                <span class="text-gray-500">Customer Feedback</span>
                <span class="font-bold text-gray-900">{{ totalReviewsLength }}</span>
              </div>

              <div class="pt-2">
                <a [routerLink]="['/shop/preview', shopId]" class="block">
                  <button type="button" class="w-full h-10 bg-gray-900 hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer">
                    Visit Official Storefront
                  </button>
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProductDetailsInfoComponent {
  @Input() data!: any;
  @Input() products: any[] = [];
  @Input() totalReviewsLength = 0;
  @Input() averageRating: any = 0;
  styles = styles;
  active = signal(1);

  get shopId(): string {
    return String(this.data?.shop?._id || this.data?.shop?.id || this.data?.shopId || '1');
  }

  get numericRating(): number {
    return Number(this.averageRating) || 0;
  }
}

// ==========================================
// 2. PRODUCT DETAILS MAIN COMPONENT
// ==========================================
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingsComponent, ProductDetailsInfoComponent],
  template: `
    <div class="bg-[#f8fafc] min-h-screen py-8">
      @if (data) {
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Top Breadcrumb -->
          <nav class="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
            <a routerLink="/" class="hover:text-gray-900 transition-colors">Home</a>
            <span>/</span>
            <a routerLink="/products" class="hover:text-gray-900 transition-colors">Products</a>
            <span>/</span>
            <span class="text-gray-900 font-semibold truncate max-w-xs">{{ data.name }}</span>
          </nav>

          <!-- Main Product Layout Grid -->
          <div class="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">

              <!-- Left 6 Cols: Gallery -->
              <div class="lg:col-span-6 flex flex-col gap-4">
                <div class="relative bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-center min-h-[380px] max-h-[460px] overflow-hidden group shadow-inner">
                  
                  <!-- Floating Status Badges -->
                  <div class="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                    @if (discountPercentage > 0) {
                      <span class="px-2.5 py-1 bg-[#f63b60] text-white text-[11px] font-extrabold rounded-md">
                        SAVE {{ discountPercentage }}%
                      </span>
                    }
                    @if (isStockAvailable) {
                      <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-md">
                        In Stock
                      </span>
                    } @else {
                      <span class="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded-md">
                        Sold Out
                      </span>
                    }
                  </div>

                  <!-- Wishlist Heart Button -->
                  <button
                    type="button"
                    (click)="click() ? removeFromWishlistHandler() : addToWishlistHandler()"
                    class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                    [title]="click() ? 'Remove from wishlist' : 'Add to wishlist'"
                  >
                    @if (click()) {
                      <app-icon name="AiFillHeart" [size]="20" color="#f63b60" />
                    } @else {
                      <app-icon name="AiOutlineHeart" [size]="20" color="#64748b" />
                    }
                  </button>

                  <!-- Main Image -->
                  <img
                    [src]="selectedImageUrl"
                    [alt]="data.name"
                    class="w-full h-full max-h-[380px] object-contain transition-transform duration-300 group-hover:scale-105"
                    (error)="handleImageError($event)"
                  />
                </div>

                <!-- Thumbnails Strip -->
                @if (imageList.length > 1) {
                  <div class="flex items-center gap-3 overflow-x-auto pb-2">
                    @for (img of imageList; track $index) {
                      <button
                        type="button"
                        (click)="select.set($index)"
                        class="w-16 h-16 rounded-xl border-2 p-1.5 shrink-0 bg-white transition-all cursor-pointer overflow-hidden"
                        [class.border-[#f63b60]]="select() === $index"
                        [class.shadow-sm]="select() === $index"
                        [class.border-gray-200]="select() !== $index"
                      >
                        <img
                          [src]="getImageUrl(img)"
                          alt="Thumbnail"
                          class="w-full h-full object-contain"
                          (error)="handleImageError($event)"
                        />
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Right 6 Cols: Details & Actions -->
              <div class="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">Brand / Merchant:</span>
                    <a [routerLink]="['/shop/preview', shopId]" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      {{ data?.shop?.name || 'Verified Seller' }}
                    </a>
                  </div>

                  <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                    {{ data.name }}
                  </h1>

                  <div class="flex items-center gap-3 mt-3 pb-4 border-b border-gray-100">
                    <div class="flex items-center gap-1.5">
                      <app-ratings [rating]="numericProductRating" />
                      <span class="text-xs font-bold text-gray-800 ml-1">
                        {{ data?.ratings ? data.ratings : averageRating() }}
                      </span>
                    </div>
                    <span class="text-gray-300">|</span>
                    <span class="text-xs text-gray-500 font-medium">
                      {{ totalReviewsLength() }} reviews
                    </span>
                    <span class="text-gray-300">|</span>
                    <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <app-icon name="AiOutlineCheckCircle" [size]="13" />
                      {{ data?.sold_out || 0 }} sold
                    </span>
                  </div>

                  <div class="py-5">
                    <div class="flex items-baseline gap-3">
                      <span class="text-3xl sm:text-4xl font-extrabold text-[#f63b60]">
                        ₹{{ formattedCurrentPrice }}
                      </span>

                      @if (data.originalPrice && data.originalPrice > currentPrice) {
                        <span class="text-lg font-medium text-gray-400 line-through">
                          ₹{{ data.originalPrice }}
                        </span>
                        <span class="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-md">
                          You save ₹{{ (data.originalPrice - currentPrice).toFixed(2) }}
                        </span>
                      }
                    </div>
                    <p class="text-xs text-gray-400 mt-1">Inclusive of all local taxes & guaranteed genuine delivery</p>
                  </div>

                  <p class="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6">
                    {{ data.description }}
                  </p>
                </div>

                <div>
                  <div class="mb-6 pt-4 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</label>
                      <span class="text-xs text-gray-400">
                        Stock available: <strong class="text-gray-700">{{ currentStock }}</strong>
                      </span>
                    </div>

                    <div class="flex items-center gap-4">
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

                      <div class="text-xs text-gray-500">
                        Subtotal: <strong class="text-gray-900">₹{{ (currentPrice * count()).toFixed(2) }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      (click)="addToCartHandler()"
                      [disabled]="!isStockAvailable"
                      class="h-12 w-full rounded-xl bg-[#f63b60] hover:bg-[#e02d51] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <app-icon name="AiOutlineShoppingCart" [size]="18" />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      (click)="buyNowHandler()"
                      [disabled]="!isStockAvailable"
                      class="h-12 w-full rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>

                  <div class="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div class="flex items-center gap-3">
                      <a [routerLink]="['/shop/preview', shopId]">
                        <img
                          [src]="data?.shop?.avatar?.url || 'https://placehold.co/50x50?text=S'"
                          alt=""
                          class="w-11 h-11 rounded-xl object-cover border border-gray-200"
                        />
                      </a>
                      <div>
                        <a [routerLink]="['/shop/preview', shopId]">
                          <h4 class="text-sm font-bold text-gray-900 hover:underline">{{ data?.shop?.name || 'Shop' }}</h4>
                        </a>
                        <p class="text-xs text-gray-500 font-medium">★ {{ averageRating() }}/5 Rating</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="handleMessageSubmit()"
                      class="px-4 py-2 bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <app-icon name="AiOutlineMessage" [size]="14" />
                      Chat Now
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <app-product-details-info
            [data]="data"
            [products]="products()"
            [totalReviewsLength]="totalReviewsLength()"
            [averageRating]="averageRating()"
          />
        </div>
      }
    </div>
  `,
})
export class ProductDetailsComponent implements OnInit {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private userStore = inject(UserStore);
  private productStore = inject(ProductStore);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private router = inject(Router);

  @Input() data!: Product | any;
  styles = styles;
  count = signal(1);
  select = signal(0);

  get productId(): string {
    return String(this.data?._id || this.data?.id || '');
  }

  get shopId(): string {
    return String(this.data?.shop?._id || this.data?.shop?.id || this.data?.shopId || '1');
  }

  get imageList(): any[] {
    return this.data?.images && this.data.images.length > 0
        ? this.data.images
        : ['https://placehold.co/400x400?text=No+Image'];
  }

  getImageUrl(img: any): string {
    if (!img) return 'https://placehold.co/400x400?text=No+Image';
    return typeof img === 'string' ? img : (img?.url || 'https://placehold.co/400x400?text=No+Image');
  }

  get selectedImageUrl(): string {
    const list = this.imageList;
    const current = list[this.select()] || list[0];
    return this.getImageUrl(current);
  }

  get currentPrice(): number {
    return Number(this.data?.discountPrice ?? this.data?.price ?? 0);
  }

  get formattedCurrentPrice(): string {
    return this.currentPrice.toFixed(2);
  }

  get currentStock(): number {
    return Number(this.data?.stock ?? this.data?.Stock ?? 1);
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

  get numericProductRating(): number {
    return Number(this.data?.ratings ?? this.averageRating()) || 0;
  }

  products = computed(() => this.productStore.products() || []);

  click = computed(() => {
    const id = this.productId;
    if (!id) return false;
    return !!this.wishlistStore.wishlist().find((i: any) => String(i._id || i.id) === id);
  });

  totalReviewsLength = computed(() =>
      (this.products() || []).reduce((acc: number, p: any) => acc + (p.reviews?.length || 0), 0)
  );

  totalRatings = computed(() =>
      (this.products() || []).reduce(
          (acc: number, p: any) => acc + (p.reviews || []).reduce((s: number, r: any) => s + (r.rating || 0), 0),
          0
      )
  );

  averageRating = computed(() => {
    const total = this.totalRatings();
    const len = this.totalReviewsLength();
    return len > 0 ? (total / len).toFixed(1) : '5.0';
  });

  ngOnInit() {
    const sId = this.shopId;
    if (sId) {
      this.productStore.getAllProductsShop(sId);
    }
  }

  incrementCount() {
    if (this.count() < this.currentStock) {
      this.count.update((c) => c + 1);
    } else {
      this.toast.error('Maximum available stock reached');
    }
  }

  decrementCount() {
    if (this.count() > 1) {
      this.count.update((c) => c - 1);
    }
  }

  removeFromWishlistHandler() {
    this.wishlistStore.removeFromWishlist({ ...this.data, _id: this.productId, id: this.productId });
    this.toast.success('Removed from wishlist');
  }

  addToWishlistHandler() {
    this.wishlistStore.addToWishlist({ ...this.data, _id: this.productId, id: this.productId });
    this.toast.success('Added to wishlist');
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
  }

  buyNowHandler() {
    this.addToCartHandler();
    this.router.navigate(['/checkout']);
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