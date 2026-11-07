import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore, WishlistStore } from '../../core/state';
import { Product } from '../../core/models';

@Component({
  selector: 'app-wishlist-single',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="border-b p-4"><div class="w-full 800px:flex items-center">
    <app-icon name="RxCross1" class="cursor-pointer mb-2 ml-2 800px:mb-0 800px:ml-0" (click)="remove.emit(data)" />
    <img [src]="data?.images[0]?.url" alt="" class="w-[130px] h-min ml-2 mr-2 rounded-[5px]" />
    <div class="pl-[5px]"><h1>{{ data.name }}</h1>
      <h4 class="font-[600] pt-3 800px:pt-[3px] text-[17px] text-[#d02222] font-Roboto">US&#36;{{ totalPrice }}</h4></div>
    <div><app-icon name="BsCartPlus" [size]="20" class="cursor-pointer" title="Add to cart" (click)="addToCart.emit(data)" /></div>
  </div></div>`,
})
export class WishlistSingleComponent {
  @Input() data!: Product;
  @Output() remove = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  value = 1;
  get totalPrice() { return this.data.discountPrice * this.value; }
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [IconComponent, WishlistSingleComponent],
  template: `<div class="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
    <div class="fixed top-0 right-0 h-full w-[80%] overflow-y-scroll 800px:w-[25%] bg-white flex flex-col justify-between shadow-sm">
      @if (wishlist().length === 0) {
        <div class="w-full h-screen flex items-center justify-center">
          <div class="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3"><app-icon name="RxCross1" [size]="25" class="cursor-pointer" (click)="closed.emit(false)" /></div>
          <h5>Wishlist Items is empty!</h5>
        </div>
      } @else {
        <div>
          <div class="flex w-full justify-end pt-5 pr-5"><app-icon name="RxCross1" [size]="25" class="cursor-pointer" (click)="closed.emit(false)" /></div>
          <div class="{{ styles.noramlFlex }} p-4"><app-icon name="AiOutlineHeart" [size]="25" /><h5 class="pl-2 text-[20px] font-[500]">{{ wishlist().length }} items</h5></div>
          <br />
          <div class="w-full border-t">
            @for (i of wishlist(); track i._id) {
              <app-wishlist-single [data]="i" (remove)="removeFromWishlistHandler($event)" (addToCart)="addToCartHandler($event)" />
            }
          </div>
        </div>
      }
    </div>
  </div>`,
})
export class WishlistComponent {
  private wishlistStore = inject(WishlistStore);
  private cartStore = inject(CartStore);
  @Output() closed = new EventEmitter<boolean>();
  styles = styles;
  wishlist = computed(() => this.wishlistStore.wishlist());
  removeFromWishlistHandler(data: Product) { this.wishlistStore.removeFromWishlist(data); }
  addToCartHandler(data: Product) { this.cartStore.addTocart({ ...data, qty: 1 } as any); this.closed.emit(false); }
}