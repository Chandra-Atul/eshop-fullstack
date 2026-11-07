import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore, WishlistStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-details-card',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="bg-[#fff]">@if (data) {
    <div class="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
      <div class="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
        <app-icon name="RxCross1" [size]="30" class="absolute right-3 top-3 z-50 cursor-pointer" (click)="closed.emit(false)" />
        <div class="block w-full 800px:flex">
          <div class="w-full 800px:w-[50%]">
            <img [src]="data.images && data.images[0]?.url" alt="" />
            <div class="flex"><a [routerLink]="['/shop/preview', data.shop?._id]" class="flex">
              <img [src]="data.images && data.images[0]?.url" alt="" class="w-[50px] h-[50px] rounded-full mr-2" />
              <div><h3 class="{{ styles.shop_name }}">{{ data.shop?.name }}</h3><h5 class="pb-3 text-[15px]">{{ data?.ratings }} Ratings</h5></div>
            </a></div>
            <div class="{{ styles.button }} bg-[#000] mt-4 rounded-[4px] h-11" (click)="handleMessageSubmit()">
              <span class="text-[#fff] flex items-center">Send Message <app-icon name="AiOutlineMessage" class="ml-1" /></span></div>
            <h5 class="text-[16px] text-[red] mt-5">(50) Sold out</h5>
          </div>
          <div class="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
            <h1 class="{{ styles.productTitle }} text-[20px]">{{ data.name }}</h1>
            <p>{{ data.description }}</p>
            <div class="flex pt-3">
              <h4 class="{{ styles.productDiscountPrice }}">{{ data.discountPrice }}$</h4>
              <h3 class="{{ styles.price }}">{{ data.originalPrice ? data.originalPrice + '$' : '' }}</h3>
            </div>
            <div class="flex items-center mt-12 justify-between pr-3">
              <div>
                <button class="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out" (click)="decrementCount()">-</button>
                <span class="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">{{ count() }}</span>
                <button class="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out" (click)="incrementCount()">+</button>
              </div>
              <div>
                @if (click()) { <app-icon name="AiFillHeart" [size]="30" class="cursor-pointer" color="red" title="Remove from wishlist" (click)="removeFromWishlistHandler(data)" /> }
                @else { <app-icon name="AiOutlineHeart" [size]="30" class="cursor-pointer" title="Add to wishlist" (click)="addToWishlistHandler(data)" /> }
              </div>
            </div>
            <div class="{{ styles.button }} mt-6 rounded-[4px] h-11 flex items-center" (click)="addToCartHandler(data._id)">
              <span class="text-[#fff] flex items-center">Add to cart <app-icon name="AiOutlineShoppingCart" class="ml-1" /></span></div>
          </div>
        </div>
      </div>
    </div>
  }</div>`,
})
export class ProductDetailsCardComponent {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private toast = inject(ToastService);
  @Input() data!: Product;
  @Output() closed = new EventEmitter<boolean>();
  styles = styles;
  count = signal(1);
  click = computed(() => !!this.wishlistStore.wishlist().find((i) => i._id === this.data?._id));
  handleMessageSubmit() {}
  decrementCount() { if (this.count() > 1) this.count.set(this.count() - 1); }
  incrementCount() { this.count.set(this.count() + 1); }
  addToCartHandler(id: string) {
    const exists = this.cartStore.cart().find((i) => i._id === id);
    if (exists) { this.toast.error('Item already in cart!'); }
    else if (this.data.stock < this.count()) { this.toast.error('Product stock limited!'); }
    else { this.cartStore.addTocart({ ...this.data, qty: this.count() } as any); this.toast.success('Item added to cart successfully!'); }
  }
  removeFromWishlistHandler(data: Product) { this.wishlistStore.removeFromWishlist(data); }
  addToWishlistHandler(data: Product) { this.wishlistStore.addToWishlist(data); }
}
