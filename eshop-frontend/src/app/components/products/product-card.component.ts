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
    <div class="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer hover:shadow-md transition-shadow">
      <div class="flex justify-end"></div>

      <!-- Product Image Link -->
      <a [routerLink]="['/product', productId]" [queryParams]="isEvent ? { isEvent: 'true' } : {}">
        <img
          [src]="mainImage"
          alt=""
          class="w-full h-[170px] object-contain"
          (error)="handleImageError($event)"
        />
      </a>

      <!-- Shop Name Link -->
      <a [routerLink]="['/shop/preview', shopId]">
        <h5 class="{{ styles.shop_name }}">{{ data?.shop?.name || 'Shop' }}</h5>
      </a>

      <!-- Product Title and Pricing -->
      <a [routerLink]="['/product', productId]" [queryParams]="isEvent ? { isEvent: 'true' } : {}">
        <h4 class="pb-3 font-[500] text-gray-800">{{ truncatedName }}</h4>
        <div class="flex">
          <app-ratings [rating]="data?.ratings ?? 0" />
        </div>
        <div class="py-2 flex items-center justify-between">
          <div class="flex items-baseline gap-2">
            <h5 class="{{ styles.productDiscountPrice }}">
              {{ (data?.discountPrice ?? data?.price ?? 0) }}$
            </h5>
            @if (data?.originalPrice && data?.originalPrice > (data?.discountPrice ?? 0)) {
              <h4 class="{{ styles.price }}">{{ data?.originalPrice }}$</h4>
            }
          </div>
          <span class="font-[400] text-[17px] text-[#68d284]">
            {{ data?.sold_out || 0 }} sold
          </span>
        </div>
      </a>

      <!-- Quick Actions -->
      <div>
        @if (isWishlist()) {
          <app-icon
            name="AiFillHeart"
            [size]="22"
            class="cursor-pointer absolute right-2 top-5"
            color="red"
            title="Remove from wishlist"
            (click)="removeFromWishlistHandler(data)"
          />
        } @else {
          <app-icon
            name="AiOutlineHeart"
            [size]="22"
            class="cursor-pointer absolute right-2 top-5"
            color="#333"
            title="Add to wishlist"
            (click)="addToWishlistHandler(data)"
          />
        }

        <app-icon
          name="AiOutlineEye"
          [size]="22"
          class="cursor-pointer absolute right-2 top-14"
          color="#333"
          title="Quick view"
          (click)="open.set(!open())"
        />

        <app-icon
          name="AiOutlineShoppingCart"
          [size]="25"
          class="cursor-pointer absolute right-2 top-24"
          color="#444"
          title="Add to cart"
          (click)="addToCartHandler()"
        />

        @if (open()) {
          <app-product-details-card [data]="normalizedProduct" (closed)="open.set(false)" />
        }
      </div>
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

  get mainImage(): string {
    const firstImg = this.data?.images?.[0];
    if (!firstImg) return 'https://placehold.co/300x300?text=No+Image';
    return typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://placehold.co/300x300?text=No+Image');
  }

  get truncatedName(): string {
    const name = this.data?.name || '';
    return name.length > 40 ? name.slice(0, 40) + '...' : name;
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

  removeFromWishlistHandler(data: any) {
    this.wishlistStore.removeFromWishlist(this.normalizedProduct);
  }

  addToWishlistHandler(data: any) {
    this.wishlistStore.addToWishlist(this.normalizedProduct);
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

    this.cartStore.addTocart(this.data, 1);
    this.toast.success(existing ? 'Cart quantity updated!' : 'Item added to cart successfully!');
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
  }
}