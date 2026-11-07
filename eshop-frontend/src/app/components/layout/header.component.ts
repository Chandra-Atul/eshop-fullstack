import { Component, HostListener, Input, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { styles } from '../../styles';
import { categoriesData } from '../../static/data';
import { IconComponent } from '../../core/icon.component';
import { DropdownComponent } from './dropdown.component';
import { NavbarComponent } from './navbar.component';
import { CartComponent } from '../cart/cart.component';
import { WishlistComponent } from '../wishlist/wishlist.component';
import { CartStore, ProductStore, SellerStore, UserStore, WishlistStore } from '../../core/state';
import { Product } from '../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, IconComponent, DropdownComponent, NavbarComponent, CartComponent, WishlistComponent],
  template: `
    <div class="{{ styles.section }}">
      <div class="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between">
        <div>
          <a routerLink="/"><img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="Logo" /></a>
        </div>
        <div class="w-[50%] relative">
          <input
            type="text"
            placeholder="Search Product..."
            [value]="searchTerm()"
            (input)="handleSearchChange($event)"
            class="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
          />
          <app-icon name="AiOutlineSearch" [size]="30" class="absolute right-2 top-1.5 cursor-pointer" />
          @if (searchData() && searchData()!.length !== 0) {
            <div class="absolute min-h-[30vh] bg-slate-50 shadow-sm-2 z-[9] p-4">
              @for (i of searchData()!; track i._id) {
                <a [routerLink]="['/product', i._id]">
                  <div class="w-full flex items-start py-3">
                    <img [src]="i.images[0]?.url" alt="" class="w-[40px] h-[40px] mr-[10px]" />
                    <h1>{{ i.name }}</h1>
                  </div>
                </a>
              }
            </div>
          }
        </div>
        <div class="{{ styles.button }}">
          <a [routerLink]="isSeller() ? '/dashboard' : '/shop-create'">
            <h1 class="text-[#fff] flex items-center">
              {{ isSeller() ? 'Go Dashboard' : 'Become Seller' }}
              <app-icon name="IoIosArrowForward" class="ml-1" />
            </h1>
          </a>
        </div>
      </div>
    </div>

    <!-- Desktop Navigation Bar -->
    <div class="{{ active() ? 'shadow-sm fixed top-0 left-0 z-10' : '' }} transition hidden 800px:flex items-center justify-between w-full bg-[#3321c8] h-[70px]">
      <div class="{{ styles.section }} relative {{ styles.noramlFlex }} justify-between">
        <div (click)="dropDown.set(!dropDown())">
          <div class="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
            <app-icon name="BiMenuAltLeft" [size]="30" class="absolute top-3 left-2" />
            <button class="h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg font-[500] select-none rounded-t-md">
              All Categories
            </button>
            <app-icon name="IoIosArrowDown" [size]="20" class="absolute right-2 top-4 cursor-pointer" (click)="dropDown.set(!dropDown())" />
            @if (dropDown()) {
              <app-dropdown [categoriesData]="categoriesData" (dropDownChange)="dropDown.set($event)" />
            }
          </div>
        </div>

        <div class="{{ styles.noramlFlex }}">
          <app-navbar [active]="activeHeading" />
        </div>

        <div class="flex">
          <!-- Wishlist Trigger -->
          <div class="{{ styles.noramlFlex }}">
            <div class="relative cursor-pointer mr-[15px]" (click)="openWishlist.set(true)">
              <app-icon name="AiOutlineHeart" [size]="30" color="rgb(255 255 255 / 83%)" />
              <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 text-white font-mono text-[12px] leading-tight text-center">
                {{ wishlist().length }}
              </span>
            </div>
          </div>

          <!-- Cart Trigger -->
          <div class="{{ styles.noramlFlex }}">
            <div class="relative cursor-pointer mr-[15px]" (click)="openCart.set(true)">
              <app-icon name="AiOutlineShoppingCart" [size]="30" color="rgb(255 255 255 / 83%)" />
              <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 text-white font-mono text-[12px] leading-tight text-center">
                {{ cart().length }}
              </span>
            </div>
          </div>

          <!-- User Profile / Auth Link -->
          <div class="{{ styles.noramlFlex }}">
            <div class="relative cursor-pointer mr-[15px]">
                @if (isAuthenticated()) {
  <a routerLink="/profile" class="flex items-center">
    @if (user()?.avatar?.url) {
      <img [src]="user()?.avatar?.url" class="w-[35px] h-[35px] rounded-full object-cover" alt="" />
    } @else {
      <app-icon name="RxAvatar" [size]="30" color="rgb(255 255 255 / 83%)" />
    }
  </a>
} @else {
  <a routerLink="/login">
    <app-icon name="CgProfile" [size]="30" color="rgb(255 255 255 / 83%)" />
  </a>
}
            </div>
          </div>

          @if (openCart()) { <app-cart (closed)="openCart.set(false)" /> }
          @if (openWishlist()) { <app-wishlist (closed)="openWishlist.set(false)" /> }
        </div>
      </div>
    </div>

    <!-- Mobile Header -->
    <div class="{{ active() ? 'shadow-sm fixed top-0 left-0 z-10' : '' }} w-full h-[60px] bg-[#fff] z-50 top-0 left-0 shadow-sm 800px:hidden">
      <div class="w-full flex items-center justify-between">
        <div>
          <app-icon name="BiMenuAltLeft" [size]="40" class="ml-4" (click)="open.set(true)" />
        </div>
        <div>
          <a routerLink="/"><img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="" class="mt-3 cursor-pointer" /></a>
        </div>
        <div>
          <div class="relative mr-[20px]" (click)="openCart.set(true)">
            <app-icon name="AiOutlineShoppingCart" [size]="30" />
            <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 text-white font-mono text-[12px] leading-tight text-center">
              {{ cart().length }}
            </span>
          </div>
        </div>
        @if (openCart()) { <app-cart (closed)="openCart.set(false)" /> }
        @if (openWishlist()) { <app-wishlist (closed)="openWishlist.set(false)" /> }
      </div>

      <!-- Mobile Drawer -->
      @if (open()) {
        <div class="fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0">
          <div class="fixed w-[70%] bg-[#fff] h-screen top-0 left-0 z-10 overflow-y-scroll">
            <div class="w-full justify-between flex pr-3">
              <div>
                <div class="relative mr-[15px]" (click)="openWishlist.set(true); open.set(false)">
                  <app-icon name="AiOutlineHeart" [size]="30" class="mt-5 ml-3" />
                  <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 text-white font-mono text-[12px] leading-tight text-center">
                    {{ wishlist().length }}
                  </span>
                </div>
              </div>
              <app-icon name="RxCross1" [size]="30" class="ml-4 mt-5" (click)="open.set(false)" />
            </div>

            <div class="my-8 w-[92%] m-auto h-[40px] relative">
              <input
                type="search"
                placeholder="Search Product..."
                class="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
                [value]="searchTerm()"
                (input)="handleSearchChange($event)"
              />
              @if (searchData()) {
                <div class="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                  @for (i of searchData()!; track i._id) {
                    <a [routerLink]="['/product', i.name.replace(' ', '-')]">
                      <div class="flex items-center">
                        <img [src]="i.images[0]?.url" alt="" class="w-[50px] mr-2" />
                        <h5>{{ i.name }}</h5>
                      </div>
                    </a>
                  }
                </div>
              }
            </div>

            <app-navbar [active]="activeHeading" />

            <div class="{{ styles.button }} ml-4 !rounded-[4px]">
              <a routerLink="/shop-create">
                <h1 class="text-[#fff] flex items-center">
                  Become Seller <app-icon name="IoIosArrowForward" class="ml-1" />
                </h1>
              </a>
            </div>

            <br /><br /><br />
            <div class="flex w-full justify-center">
              @if (isAuthenticated()) {
                <div>
                  <a routerLink="/profile" (click)="open.set(false)" class="flex items-center justify-center">
                    @if (user()?.avatar?.url) {
                      <img [src]="user()?.avatar?.url" alt="" class="w-[60px] h-[60px] rounded-full border-[3px] border-[#0eae88] object-cover" />
                    } @else {
                      <app-icon name="RxAvatar" [size]="60" color="#0eae88" />
                    }
                  </a>
                </div>
              } @else {
                <a routerLink="/login" (click)="open.set(false)" class="text-[18px] pr-[10px] text-[#000000b7]">Login /</a>
                <a routerLink="/sign-up" (click)="open.set(false)" class="text-[18px] text-[#000000b7]">Sign up</a>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HeaderComponent {
  private userStore = inject(UserStore);
  private sellerStore = inject(SellerStore);
  private productStore = inject(ProductStore);
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);

  @Input() activeHeading?: number;
  styles = styles;
  categoriesData = categoriesData;

  searchTerm = signal('');
  searchData = signal<Product[] | null>(null);
  active = signal(false);
  dropDown = signal(false);
  openCart = signal(false);
  openWishlist = signal(false);
  open = signal(false);

  isAuthenticated = computed(() => this.userStore.isAuthenticated());
  user = computed(() => this.userStore.user());
  isSeller = computed(() => this.sellerStore.isSeller());
  cart = computed(() => this.cartStore.cart());
  wishlist = computed(() => this.wishlistStore.wishlist());

  @HostListener('window:scroll') onScroll() {
    this.active.set(window.scrollY > 70);
  }

  handleSearchChange(e: Event) {
    const term = (e.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.searchData.set(
        (this.productStore.allProducts() || []).filter((p) =>
            p.name.toLowerCase().includes(term.toLowerCase())
        )
    );
  }
}