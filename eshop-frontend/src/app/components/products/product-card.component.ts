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
  template: `<div class="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer">
    <div class="flex justify-end"></div>
    <a [routerLink]="['/product', data._id]" [queryParams]="isEvent ? { isEvent: 'true' } : {}">
      <img [src]="data.images && data.images[0]?.url" alt="" class="w-full h-[170px] object-contain" /></a>
    <a [routerLink]="['/shop/preview', data?.shop?._id]"><h5 class="{{ styles.shop_name }}">{{ data.shop?.name }}</h5></a>
    <a [routerLink]="['/product', data._id]" [queryParams]="isEvent ? { isEvent: 'true' } : {}">
      <h4 class="pb-3 font-[500]">{{ truncatedName }}</h4>
      <div class="flex"><app-ratings [rating]="data?.ratings ?? 0" /></div>
      <div class="py-2 flex items-center justify-between">
        <div class="flex">
          <h5 class="{{ styles.productDiscountPrice }}">{{ data.originalPrice === 0 ? data.originalPrice : data.discountPrice }}$</h5>
          <h4 class="{{ styles.price }}">{{ data.originalPrice ? data.originalPrice + ' $' : '' }}</h4>
        </div>
        <span class="font-[400] text-[17px] text-[#68d284]">{{ data?.sold_out }} sold</span>
      </div>
    </a>
    <div>
      @if (click()) { <app-icon name="AiFillHeart" [size]="22" class="cursor-pointer absolute right-2 top-5" color="red" title="Remove from wishlist" (click)="removeFromWishlistHandler(data)" /> }
      @else { <app-icon name="AiOutlineHeart" [size]="22" class="cursor-pointer absolute right-2 top-5" color="#333" title="Add to wishlist" (click)="addToWishlistHandler(data)" /> }
      <app-icon name="AiOutlineEye" [size]="22" class="cursor-pointer absolute right-2 top-14" color="#333" title="Quick view" (click)="open.set(!open())" />
      <app-icon name="AiOutlineShoppingCart" [size]="25" class="cursor-pointer absolute right-2 top-24" color="#444" title="Add to cart" (click)="addToCartHandler(data._id)" />
      @if (open()) { <app-product-details-card [data]="data" (closed)="open.set(false)" /> }
    </div>
  </div>`,
})
export class ProductCardComponent {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private toast = inject(ToastService);
  @Input() data!: Product;
  @Input() isEvent?: boolean;
  styles = styles;
  open = signal(false);
  click = computed(() => !!this.wishlistStore.wishlist().find((i) => i._id === this.data._id));
  get truncatedName() { return this.data.name.length > 40 ? this.data.name.slice(0, 40) + '...' : this.data.name; }
  removeFromWishlistHandler(data: Product) { this.wishlistStore.removeFromWishlist(data); }
  addToWishlistHandler(data: Product) { this.wishlistStore.addToWishlist(data); }
  addToCartHandler(id: string) {
    const exists = this.cartStore.cart().find((i) => i._id === id);
    if (exists) { this.toast.error('Item already in cart!'); }
    else if (this.data.stock < 1) { this.toast.error('Product stock limited!'); }
    else { this.cartStore.addTocart({ ...this.data, qty: 1 } as any); this.toast.success('Item added to cart successfully!'); }
  }
}
