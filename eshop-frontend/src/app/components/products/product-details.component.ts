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
  imports: [RouterLink, RatingsComponent],
  template: `
    <div class="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded">
      <div class="w-full flex justify-between border-b pt-10 pb-2">
        <div class="relative">
          <h5
            class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
            (click)="active.set(1)"
          >
            Product Details
          </h5>
          @if (active() === 1) {
            <div class="{{ styles.active_indicator }}"></div>
          }
        </div>
        <div class="relative">
          <h5
            class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
            (click)="active.set(2)"
          >
            Product Reviews
          </h5>
          @if (active() === 2) {
            <div class="{{ styles.active_indicator }}"></div>
          }
        </div>
        <div class="relative">
          <h5
            class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"
            (click)="active.set(3)"
          >
            Seller Information
          </h5>
          @if (active() === 3) {
            <div class="{{ styles.active_indicator }}"></div>
          }
        </div>
      </div>

      <!-- Tab 1: Details -->
      @if (active() === 1) {
        <p class="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line text-gray-700">
          {{ data?.description || 'No description provided.' }}
        </p>
      }

      <!-- Tab 2: Reviews -->
      @if (active() === 2) {
        <div class="w-full min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
          @if (data) {
            @for (item of data.reviews || []; track $index) {
              <div class="w-full flex my-2">
                <img
                  [src]="item?.user?.avatar?.url || 'https://placehold.co/50x50?text=U'"
                  alt=""
                  class="w-[50px] h-[50px] rounded-full object-cover"
                />
                <div class="pl-2">
                  <div class="w-full flex items-center">
                    <h1 class="font-[500] mr-3">{{ item?.user?.name }}</h1>
                    <app-ratings [rating]="data?.ratings ?? 0" />
                  </div>
                  <p class="text-gray-600 text-sm mt-1">{{ item?.comment }}</p>
                </div>
              </div>
            }
          }
          <div class="w-full flex justify-center mt-4">
            @if (!data?.reviews || data.reviews.length === 0) {
              <h5 class="text-gray-500">No reviews yet for this product!</h5>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Seller Info -->
      @if (active() === 3) {
        <div class="w-full block 800px:flex p-5">
          <div class="w-full 800px:w-[50%]">
            <a [routerLink]="['/shop/preview', shopId]">
              <div class="flex items-center">
                <img
                  [src]="data?.shop?.avatar?.url || 'https://placehold.co/50x50?text=S'"
                  class="w-[50px] h-[50px] rounded-full object-cover"
                  alt=""
                />
                <div class="pl-3">
                  <h3 class="{{ styles.shop_name }}">{{ data?.shop?.name || 'Shop' }}</h3>
                  <h5 class="pb-2 text-[15px] text-gray-500">({{ averageRating }}/5) Ratings</h5>
                </div>
              </div>
            </a>
            <p class="pt-2 text-gray-600">{{ data?.shop?.description || 'No shop description available.' }}</p>
          </div>
          <div class="w-full 800px:w-[50%] mt-5 800px:mt-0 800px:flex flex-col items-end">
            <div class="text-left">
              <h5 class="font-[600] text-gray-700">
                Joined on: <span class="font-[500] text-gray-600">{{ data?.shop?.createdAt?.slice(0, 10) || 'Recent' }}</span>
              </h5>
              <h5 class="font-[600] pt-3 text-gray-700">
                Total Products: <span class="font-[500] text-gray-600">{{ products ? products.length : 0 }}</span>
              </h5>
              <h5 class="font-[600] pt-3 text-gray-700">
                Total Reviews: <span class="font-[500] text-gray-600">{{ totalReviewsLength }}</span>
              </h5>
              <a [routerLink]="['/shop/preview', shopId]">
                <div class="{{ styles.button }} !rounded-[4px] !h-[39.5px] mt-3">
                  <h4 class="text-white">Visit Shop</h4>
                </div>
              </a>
            </div>
          </div>
        </div>
      }
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
}

// ==========================================
// 2. PRODUCT DETAILS MAIN COMPONENT
// ==========================================
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingsComponent, ProductDetailsInfoComponent],
  template: `
    <div class="bg-white">
      @if (data) {
        <div class="{{ styles.section }} w-[90%] 800px:w-[80%]">
          <div class="w-full py-5">
            <div class="block w-full 800px:flex gap-8">
              <!-- Left: Images -->
              <div class="w-full 800px:w-[50%]">
                <img
                  [src]="selectedImageUrl"
                  alt=""
                  class="w-[85%] max-h-[420px] object-contain mx-auto"
                  (error)="handleImageError($event)"
                />
                <div class="w-full flex flex-wrap gap-3 mt-4 justify-center">
                  @for (img of imageList; track $index) {
                    <div
                      class="border-2 rounded p-1 cursor-pointer transition-all {{ select() === $index ? 'border-teal-500 shadow-sm' : 'border-gray-200' }}"
                      (click)="select.set($index)"
                    >
                      <img
                        [src]="getImageUrl(img)"
                        alt=""
                        class="h-[65px] w-[65px] object-contain"
                        (error)="handleImageError($event)"
                      />
                    </div>
                  }
                </div>
              </div>

              <!-- Right: Product Info & Actions -->
              <div class="w-full 800px:w-[50%] pt-5">
                <h1 class="{{ styles.productTitle }} text-gray-900">{{ data.name }}</h1>
                <p class="text-gray-600 mt-2 text-sm leading-relaxed">{{ data.description }}</p>
                <div class="flex items-baseline gap-3 pt-3">
                  <h4 class="{{ styles.productDiscountPrice }}">
                    {{ (data.discountPrice ?? data.price ?? 0) }}$
                  </h4>
                  @if (data.originalPrice && data.originalPrice > (data.discountPrice ?? 0)) {
                    <h3 class="{{ styles.price }}">{{ data.originalPrice }}$</h3>
                  }
                </div>

                <!-- Quantity & Wishlist -->
                <div class="flex items-center mt-10 justify-between pr-3">
                  <div class="flex items-center select-none">
                    <button
                      type="button"
                      class="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow hover:opacity-85 transition cursor-pointer"
                      (click)="decrementCount()"
                    >
                      -
                    </button>
                    <span class="bg-gray-100 text-gray-800 font-semibold px-5 py-[8.5px] border-y border-gray-200">
                      {{ count() }}
                    </span>
                    <button
                      type="button"
                      class="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r px-4 py-2 shadow hover:opacity-85 transition cursor-pointer"
                      (click)="incrementCount()"
                    >
                      +
                    </button>
                  </div>
                  <div>
                    @if (click()) {
                      <app-icon
                        name="AiFillHeart"
                        [size]="30"
                        class="cursor-pointer"
                        color="red"
                        title="Remove from wishlist"
                        (click)="removeFromWishlistHandler()"
                      />
                    } @else {
                      <app-icon
                        name="AiOutlineHeart"
                        [size]="30"
                        class="cursor-pointer"
                        color="#333"
                        title="Add to wishlist"
                        (click)="addToWishlistHandler()"
                      />
                    }
                  </div>
                </div>

                <!-- Add to Cart Button -->
                <div
                  class="{{ styles.button }} !mt-6 !rounded !h-11 flex items-center justify-center cursor-pointer shadow hover:opacity-90 transition"
                  (click)="addToCartHandler()"
                >
                  <span class="text-white flex items-center font-medium">
                    Add to cart <app-icon name="AiOutlineShoppingCart" class="ml-2" />
                  </span>
                </div>

                <!-- Shop Profile Strip -->
                <div class="flex items-center pt-8 border-t mt-8">
                  <a [routerLink]="['/shop/preview', shopId]">
                    <img
                      [src]="data?.shop?.avatar?.url || 'https://placehold.co/50x50?text=S'"
                      alt=""
                      class="w-[50px] h-[50px] rounded-full object-cover mr-3 border"
                    />
                  </a>
                  <div class="pr-6">
                    <a [routerLink]="['/shop/preview', shopId]">
                      <h3 class="{{ styles.shop_name }} pb-1">{{ data?.shop?.name || 'Shop' }}</h3>
                    </a>
                    <h5 class="text-sm text-gray-500">({{ averageRating() }}/5) Ratings</h5>
                  </div>
                  <div
                    class="{{ styles.button }} bg-[#6443d1] !rounded !h-10 ml-auto cursor-pointer"
                    (click)="handleMessageSubmit()"
                  >
                    <span class="text-white flex items-center text-sm">
                      Send Message <app-icon name="AiOutlineMessage" class="ml-1" />
                    </span>
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
          <br /><br />
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
    return len > 0 ? (total / len).toFixed(2) : '0.00';
  });

  ngOnInit() {
    const sId = this.shopId;
    if (sId) {
      this.productStore.getAllProductsShop(sId);
    }
  }

  incrementCount() {
    const maxStock = Number(this.data?.stock ?? this.data?.Stock ?? 99);
    if (this.count() < maxStock) {
      this.count.update((c) => c + 1);
    } else {
      this.toast.error('Product stock limited!');
    }
  }

  decrementCount() {
    if (this.count() > 1) {
      this.count.update((c) => c - 1);
    }
  }

  removeFromWishlistHandler() {
    this.wishlistStore.removeFromWishlist({ ...this.data, _id: this.productId, id: this.productId });
  }

  addToWishlistHandler() {
    this.wishlistStore.addToWishlist({ ...this.data, _id: this.productId, id: this.productId });
  }

  addToCartHandler() {
    const id = this.productId;
    if (!id) {
      this.toast.error('Product identifier not found');
      return;
    }

    const availableStock = Number(this.data?.stock ?? this.data?.Stock ?? 1);
    const selectedQuantity = this.count();

    if (availableStock < selectedQuantity) {
      this.toast.error('Product stock limited!');
      return;
    }

    const cartList = this.cartStore.cart() || [];
    const existingIndex = cartList.findIndex((i: any) => String(i._id || i.id) === id);

    let updatedList: any[];

    if (existingIndex > -1) {
      // Overwrite with the explicitly chosen quantity from the details counter
      const existingItem = cartList[existingIndex];
      const updatedItem = {
        ...existingItem,
        ...this.data,
        _id: id,
        id: id,
        qty: selectedQuantity,
      };

      updatedList = [...cartList];
      updatedList[existingIndex] = updatedItem;
      this.toast.success(`Cart updated to ${selectedQuantity} items!`);
    } else {
      // Add as a new entry with the selected count
      const newItem = {
        ...this.data,
        _id: id,
        id: id,
        qty: selectedQuantity,
      };

      updatedList = [...cartList, newItem];
      this.toast.success('Item added to cart successfully!');
    }

    // Persist directly to store and localStorage
    this.cartStore.cart.set(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(updatedList));
    }
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
      this.toast.error('Please login to create a conversation');
    }
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
  }
}