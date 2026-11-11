import { Component, Input, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore, WishlistStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { Product } from '../../core/models';
import { RatingsComponent } from './ratings.component';
import { ProductDetailsCardComponent } from './product-details-card.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingsComponent, ProductDetailsCardComponent],
  template: `
    <div class="w-full bg-white rounded-2xl shadow-xs hover:shadow-md border border-gray-100 p-3.5 relative transition-all duration-200 flex flex-col justify-between group">
      
      <!-- Top Badges & Quick Action Sidebar -->
      <div class="relative w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center h-[180px]">
        @if (discountPercentage > 0) {
          <span class="absolute top-2 left-2 z-10 px-2 py-0.5 bg-[#f63b60] text-white text-[10px] font-extrabold rounded-md shadow-2xs">
            -{{ discountPercentage }}%
          </span>
        }

        <!-- Product Image Link -->
        <a [routerLink]="['/product', productId]" [queryParams]="isEvent ? { isEvent: 'true' } : {}" class="w-full h-full flex items-center justify-center p-2">
          <img
            [src]="mainImage"
            [alt]="data?.name"
            class="max-h-[160px] max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            (error)="handleImageError($event)"
          />
        </a>

        <!-- Floating Quick Action Icons -->
        <div class="absolute right-2 top-2 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            (click)="isWishlist() ? removeFromWishlistHandler() : addToWishlistHandler()"
            class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200/80 flex items-center justify-center shadow-xs hover:bg-white hover:scale-105 transition-all cursor-pointer"
            [title]="isWishlist() ? 'Remove from wishlist' : 'Add to wishlist'"
          >
            @if (isWishlist()) {
              <app-icon name="AiFillHeart" [size]="16" color="#f63b60" />
            } @else {
              <app-icon name="AiOutlineHeart" [size]="16" color="#64748b" />
            }
          </button>

          <button
            type="button"
            (click)="open.set(true)"
            class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200/80 flex items-center justify-center shadow-xs hover:bg-white hover:scale-105 transition-all cursor-pointer"
            title="Quick preview"
          >
            <app-icon name="AiOutlineEye" [size]="16" color="#64748b" />
          </button>

          <button
            type="button"
            (click)="addToCartHandler()"
            class="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-gray-200/80 flex items-center justify-center shadow-xs hover:bg-white hover:scale-105 transition-all cursor-pointer"
            title="Add to cart"
          >
            <app-icon name="AiOutlineShoppingCart" [size]="16" color="#64748b" />
          </button>
        </div>
      </div>

      <!-- Details Section -->
      <div class="pt-3 flex flex-col flex-1 justify-between">
        <div>
          <!-- Shop Link -->
          <a [routerLink]="['/shop/preview', shopId]" class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-indigo-600 transition-colors truncate block">
            {{ data?.shop?.name || 'Shop' }}
          </a>

          <!-- Product Name -->
          <a [routerLink]="['/product', productId]" [queryParams]="isEvent ? { isEvent: 'true' } : {}" class="block mt-1">
            <h4 class="font-semibold text-sm text-gray-800 hover:text-[#f63b60] transition-colors line-clamp-2 leading-snug">
              {{ data?.name }}
            </h4>
          </a>

          <!-- Ratings -->
          <div class="flex items-center gap-1.5 mt-1.5">
            <app-ratings [rating]="data?.ratings ?? 5" />
            <span class="text-[11px] text-gray-400 font-medium">({{ data?.reviews?.length || 0 }})</span>
          </div>
        </div>

        <!-- Price & Sold Row -->
        <div class="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-baseline gap-1.5">
            <span class="text-base font-extrabold text-[#f63b60]">
              ₹{{ currentPrice.toFixed(0) }}
            </span>
            @if (data?.originalPrice && data.originalPrice > currentPrice) {
              <span class="text-xs text-gray-400 line-through">
                ₹{{ data.originalPrice }}
              </span>
            }
          </div>

          <span class="text-xs font-semibold text-emerald-600">
            {{ data?.sold_out || 0 }} sold
          </span>
        </div>
      </div>

      <!-- Quick View Modal Mount -->
      @if (open()) {
        <app-product-details-card [data]="normalizedProduct" (closed)="open.set(false)" />
      }
    </div>
  `,
})
export class ProductCardComponent {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private toast = inject(ToastService);

  @Input() data!: Product | any;
  @Input() isEvent?: boolean;

  styles = styles;
  open = signal(false);

  get productId(): string {
    return String(this.data?._id || this.data?.id || '');
  }

  get shopId(): string {
    return String(this.data?.shop?._id || this.data?.shop?.id || this.data?.shopId || '1');
  }

  get currentPrice(): number {
    return Number(this.data?.discountPrice ?? this.data?.price ?? 0);
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
    if (!firstImg) return 'https://placehold.co/300x300?text=No+Image';
    return typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://placehold.co/300x300?text=No+Image');
  }

  get normalizedProduct(): any {
    return {
      ...this.data,
      _id: this.productId,
      id: this.productId,
    };
  }

  isWishlist = computed(() => {
    const currentId = this.productId;
    if (!currentId) return false;
    return !!this.wishlistStore.wishlist().find((i: any) => String(i._id || i.id) === currentId);
  });

  removeFromWishlistHandler() {
    this.wishlistStore.removeFromWishlist(this.normalizedProduct);
    this.toast.success('Removed from wishlist');
  }

  addToWishlistHandler() {
    this.wishlistStore.addToWishlist(this.normalizedProduct);
    this.toast.success('Added to wishlist');
  }

  addToCartHandler() {
    const id = this.productId;
    if (!id) {
      this.toast.error('Product identifier not found');
      return;
    }

    const availableStock = Number(this.data?.stock ?? this.data?.Stock ?? 1);
    const cartItems = this.cartStore.cart() || [];
    const existing = cartItems.find((i: any) => String(i._id || i.id) === id);
    const currentQty = existing ? Number(existing.qty) || 1 : 0;

    if (currentQty + 1 > availableStock) {
      this.toast.error('Product stock limited!');
      return;
    }

    this.cartStore.addTocart(this.normalizedProduct, 1);
    this.toast.success(existing ? 'Cart quantity updated!' : 'Item added to cart!');
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
  }
}