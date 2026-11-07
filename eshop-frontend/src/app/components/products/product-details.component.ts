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

@Component({
  selector: 'app-product-details-info',
  standalone: true,
  imports: [RouterLink, RatingsComponent],
  template: `<div class="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded">
    <div class="w-full flex justify-between border-b pt-10 pb-2">
      <div class="relative"><h5 class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]" (click)="active.set(1)">Product Details</h5>
        @if (active() === 1) { <div class="{{ styles.active_indicator }}"></div> }</div>
      <div class="relative"><h5 class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]" (click)="active.set(2)">Product Reviews</h5>
        @if (active() === 2) { <div class="{{ styles.active_indicator }}"></div> }</div>
      <div class="relative"><h5 class="text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]" (click)="active.set(3)">Seller Information</h5>
        @if (active() === 3) { <div class="{{ styles.active_indicator }}"></div> }</div>
    </div>
    @if (active() === 1) { <p class="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line">{{ data.description }}</p> }
    @if (active() === 2) {
      <div class="w-full min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
        @if (data) {
          @for (item of data.reviews || []; track $index) {
            <div class="w-full flex my-2">
              <img [src]="item.user.avatar?.url" alt="" class="w-[50px] h-[50px] rounded-full" />
              <div class="pl-2"><div class="w-full flex items-center">
                <h1 class="font-[500] mr-3">{{ item.user.name }}</h1><app-ratings [rating]="data?.ratings ?? 0" /></div>
                <p>{{ item.comment }}</p></div>
            </div>
          }
        }
        <div class="w-full flex justify-center">
          @if (data && (data.reviews || []).length === 0) { <h5>No Reviews have for this product!</h5> }
        </div>
      </div>
    }
    @if (active() === 3) {
      <div class="w-full block 800px:flex p-5">
        <div class="w-full 800px:w-[50%]">
          <a [routerLink]="['/shop/preview', data.shop?._id]"><div class="flex items-center">
            <img [src]="data?.shop?.avatar?.url" class="w-[50px] h-[50px] rounded-full" alt="" />
            <div class="pl-3"><h3 class="{{ styles.shop_name }}">{{ data.shop?.name }}</h3><h5 class="pb-2 text-[15px]">({{ averageRating }}/5) Ratings</h5></div>
          </div></a>
          <p class="pt-2">{{ data.shop?.description }}</p>
        </div>
        <div class="w-full 800px:w-[50%] mt-5 800px:mt-0 800px:flex flex-col items-end">
          <div class="text-left">
            <h5 class="font-[600]">Joined on: <span class="font-[500]">{{ data.shop?.createdAt?.slice(0, 10) }}</span></h5>
            <h5 class="font-[600] pt-3">Total Products: <span class="font-[500]">{{ products && products.length }}</span></h5>
            <h5 class="font-[600] pt-3">Total Reviews: <span class="font-[500]">{{ totalReviewsLength }}</span></h5>
            <a routerLink="/"><div class="{{ styles.button }} !rounded-[4px] !h-[39.5px] mt-3"><h4 class="text-white">Visit Shop</h4></div></a>
          </div>
        </div>
      </div>
    }
  </div>`,
})
export class ProductDetailsInfoComponent {
  @Input() data!: any;
  @Input() products: any[] = [];
  @Input() totalReviewsLength = 0;
  @Input() averageRating: any = 0;
  styles = styles;
  active = signal(1);
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink, IconComponent, RatingsComponent, ProductDetailsInfoComponent],
  template: `<div class="bg-white">@if (data) {
    <div class="{{ styles.section }} w-[90%] 800px:w-[80%]">
      <div class="w-full py-5"><div class="block w-full 800px:flex">
        <div class="w-full 800px:w-[50%]">
          <img [src]="data.images[select()]?.url" alt="" class="w-[80%]" />
          <div class="w-full flex">
            @for (i of data.images; track $index) {
              <div class="{{ select() === $index ? 'border' : '' }} cursor-pointer"><img [src]="i?.url" alt="" class="h-[200px] overflow-hidden mr-3 mt-3" (click)="select.set($index)" /></div>
            }
          </div>
        </div>
        <div class="w-full 800px:w-[50%] pt-5">
          <h1 class="{{ styles.productTitle }}">{{ data.name }}</h1>
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
              @else { <app-icon name="AiOutlineHeart" [size]="30" class="cursor-pointer" color="#333" title="Add to wishlist" (click)="addToWishlistHandler(data)" /> }
            </div>
          </div>
          <div class="{{ styles.button }} !mt-6 !rounded !h-11 flex items-center" (click)="addToCartHandler(data._id)">
            <span class="text-white flex items-center">Add to cart <app-icon name="AiOutlineShoppingCart" class="ml-1" /></span></div>
          <div class="flex items-center pt-8">
            <a [routerLink]="['/shop/preview', data?.shop?._id]"><img [src]="data?.shop?.avatar?.url" alt="" class="w-[50px] h-[50px] rounded-full mr-2" /></a>
            <div class="pr-8">
              <a [routerLink]="['/shop/preview', data?.shop?._id]"><h3 class="{{ styles.shop_name }} pb-1 pt-1">{{ data.shop?.name }}</h3></a>
              <h5 class="pb-3 text-[15px]">({{ averageRating() }}/5) Ratings</h5>
            </div>
            <div class="{{ styles.button }} bg-[#6443d1] mt-4 !rounded !h-11" (click)="handleMessageSubmit()">
              <span class="text-white flex items-center">Send Message <app-icon name="AiOutlineMessage" class="ml-1" /></span></div>
          </div>
        </div>
      </div></div>
      <app-product-details-info [data]="data" [products]="products()" [totalReviewsLength]="totalReviewsLength()" [averageRating]="averageRating()" />
      <br /><br />
    </div>
  }</div>`,
})
export class ProductDetailsComponent implements OnInit {
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private userStore = inject(UserStore);
  private productStore = inject(ProductStore);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  private router = inject(Router);
  @Input() data!: Product;
  styles = styles;
  count = signal(1);
  select = signal(0);
  products = computed(() => this.productStore.products() || []);
  click = computed(() => !!this.wishlistStore.wishlist().find((i) => i._id === this.data?._id));
  totalReviewsLength = computed(() => (this.products() || []).reduce((acc, p) => acc + (p.reviews?.length || 0), 0));
  totalRatings = computed(() => (this.products() || []).reduce((acc, p) => acc + (p.reviews || []).reduce((s, r) => s + r.rating, 0), 0));
  averageRating = computed(() => ((this.totalRatings() / this.totalReviewsLength()) || 0).toFixed(2));
  ngOnInit() { this.productStore.getAllProductsShop(this.data?.shop?._id); }
  incrementCount() { this.count.set(this.count() + 1); }
  decrementCount() { if (this.count() > 1) this.count.set(this.count() - 1); }
  removeFromWishlistHandler(data: Product) { this.wishlistStore.removeFromWishlist(data); }
  addToWishlistHandler(data: Product) { this.wishlistStore.addToWishlist(data); }
  addToCartHandler(id: string) {
    const exists = this.cartStore.cart().find((i) => i._id === id);
    if (exists) { this.toast.error('Item already in cart!'); }
    else if (this.data.stock < 1) { this.toast.error('Product stock limited!'); }
    else { this.cartStore.addTocart({ ...this.data, qty: this.count() } as any); this.toast.success('Item added to cart successfully!'); }
  }
  async handleMessageSubmit() {
    const user = this.userStore.user();
    if (this.userStore.isAuthenticated()) {
      try {
        const res: any = await this.api.post(`${server}/conversation/create-new-conversation`, {
          groupTitle: this.data._id + user?._id, userId: user?._id, sellerId: this.data.shop._id,
        });
        this.router.navigateByUrl(`/inbox?${res.conversation._id}`);
      } catch (error) { this.toast.error(this.api.message(error)); }
    } else { this.toast.error('Please login to create a conversation'); }
  }
}