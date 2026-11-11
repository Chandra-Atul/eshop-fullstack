import { Component, HostListener, Input, OnInit, computed, inject, signal } from '@angular/core';
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
    <!-- Top Brand & Search Bar (Desktop) -->
    <header class="bg-white border-b border-gray-100 hidden 800px:block">
      <div class="{{ styles.section }} py-4 flex items-center justify-between gap-8">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 select-none group shrink-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-black tracking-tight text-gray-900 leading-none">
              Shop<span class="text-[#4f46e5]">O</span>
            </span>
            <span class="text-[9px] tracking-widest uppercase font-bold text-gray-400 mt-0.5">Marketplace</span>
          </div>
        </a>

        <!-- Interactive Search Input -->
        <div class="flex-1 max-w-2xl relative">
          <div class="relative flex items-center">
            <input
              type="text"
              placeholder="Search products, brands, essentials..."
              [value]="searchTerm()"
              (input)="handleSearchChange($event)"
              class="h-11 w-full pl-11 pr-4 bg-gray-50/80 hover:bg-gray-50 focus:bg-white text-sm text-gray-800 rounded-full border border-gray-200 focus:border-[#4f46e5] focus:ring-3 focus:ring-[#4f46e5]/10 outline-none transition-all placeholder:text-gray-400 shadow-2xs"
            />
            <div class="absolute left-3.5 text-gray-400 pointer-events-none flex items-center">
              <app-icon name="AiOutlineSearch" [size]="20" />
            </div>
            @if (searchTerm()) {
              <button
                type="button"
                (click)="clearSearch()"
                class="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <app-icon name="RxCross1" [size]="14" />
              </button>
            }
          </div>

          <!-- Instant Search Preview Dropdown -->
          @if (searchData() && searchData()!.length !== 0) {
            <div class="absolute top-13 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-2 max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
              <div class="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Products Found</div>
              @for (i of searchData()!; track (i._id || i.id)) {
                <a 
                  [routerLink]="['/product', i._id || i.id]" 
                  (click)="clearSearch()"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <img 
                    [src]="i.images && i.images[0]?.url ? i.images[0].url : 'https://placehold.co/45x45?text=P'" 
                    alt="" 
                    class="w-11 h-11 object-contain rounded-lg border border-gray-100 bg-white shrink-0 p-0.5" 
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-semibold text-gray-800 group-hover:text-[#4f46e5] truncate transition-colors">
                      {{ i.name }}
                    </h4>
                    <span class="text-[11px] text-gray-400 font-medium">₹{{ (i.discountPrice ?? i.price ?? 0) }}</span>
                  </div>
                  <app-icon name="AiOutlineArrowRight" [size]="14" class="text-gray-300 group-hover:text-[#4f46e5] group-hover:translate-x-0.5 transition-all" />
                </a>
              }
            </div>
          }
        </div>

        <!-- Seller Hub Button -->
        <a [routerLink]="isSeller() ? '/dashboard' : '/shop-create'" class="shrink-0">
          <button class="h-10 px-5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs hover:shadow-sm transition-all cursor-pointer">
            <span>{{ isSeller() ? 'Seller Dashboard' : 'Become a Seller' }}</span>
            <app-icon name="IoIosArrowForward" [size]="14" />
          </button>
        </a>

      </div>
    </header>

    <!-- Main Navigation Bar (Desktop) -->
    <nav 
      class="hidden 800px:block w-full transition-all duration-300 z-40 bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] shadow-md"
      [class.fixed]="active()"
      [class.top-0]="active()"
      [class.shadow-lg]="active()"
    >
      <div class="{{ styles.section }} flex items-center justify-between h-[60px]">
        
        <!-- Category Dropdown Trigger -->
        <div class="relative">
          <button 
            type="button"
            (click)="dropDown.set(!dropDown())"
            class="h-10 px-4 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl flex items-center gap-3 backdrop-blur-xs border border-white/10 transition-colors cursor-pointer select-none"
          >
            <app-icon name="BiMenuAltLeft" [size]="20" />
            <span>All Categories</span>
            <app-icon name="IoIosArrowDown" [size]="14" [class.rotate-180]="dropDown()" class="transition-transform" />
          </button>

          @if (dropDown()) {
            <div class="absolute left-0 top-12 z-50 animate-in fade-in zoom-in-95 duration-150">
              <app-dropdown [categoriesData]="categoriesData" (dropDownChange)="dropDown.set($event)" />
            </div>
          }
        </div>

        <!-- Center Nav Items -->
        <div class="flex items-center">
          <app-navbar [active]="activeHeading" />
        </div>

        <!-- Quick User Controls -->
        <div class="flex items-center gap-1 sm:gap-2">
          
          <!-- Wishlist Trigger -->
          <button 
            type="button"
            (click)="openWishlist.set(true)"
            class="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white relative transition-colors cursor-pointer"
            title="Wishlist"
          >
            <app-icon name="AiOutlineHeart" [size]="22" />
            @if (wishlist().length > 0) {
              <span class="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#f43f5e] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {{ wishlist().length }}
              </span>
            }
          </button>

          <!-- Cart Trigger -->
          <button 
            type="button"
            (click)="openCart.set(true)"
            class="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white relative transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <app-icon name="AiOutlineShoppingCart" [size]="22" />
            @if (cart().length > 0) {
              <span class="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#10b981] text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                {{ cart().length }}
              </span>
            }
          </button>

          <!-- Divider -->
          <div class="w-px h-5 bg-white/15 mx-1"></div>

          <!-- User Profile / Auth Link -->
          <div class="flex items-center pl-1">
            @if (isAuthenticated()) {
              <a routerLink="/profile" class="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors">
                @if (user()?.avatar?.url) {
                  <img [src]="user()?.avatar?.url" class="w-8 h-8 rounded-full object-cover border border-white/40" alt="Profile" />
                } @else {
                  <div class="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                    {{ (user()?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                }
              </a>
            } @else {
              <a 
                routerLink="/login" 
                class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/10 transition-colors"
              >
                Sign In
              </a>
            }
          </div>

        </div>

      </div>
    </nav>

    <!-- Mobile Header -->
    <header 
      class="800px:hidden w-full h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40 transition-all"
      [class.fixed]="active()"
      [class.top-0]="active()"
      [class.shadow-sm]="active()"
    >
      <button 
        type="button"
        (click)="open.set(true)"
        class="w-10 h-10 flex items-center justify-center text-gray-700 cursor-pointer"
      >
        <app-icon name="BiMenuAltLeft" [size]="26" />
      </button>

      <!-- Mobile Brand Logo -->
      <a routerLink="/" class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-xs">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <span class="text-xl font-black text-gray-900 leading-none">
          Shop<span class="text-[#4f46e5]">O</span>
        </span>
      </a>

      <!-- Mobile Cart Icon -->
      <button 
        type="button"
        (click)="openCart.set(true)"
        class="w-10 h-10 flex items-center justify-center text-gray-700 relative cursor-pointer"
      >
        <app-icon name="AiOutlineShoppingCart" [size]="24" />
        @if (cart().length > 0) {
          <span class="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#10b981] text-white font-mono text-[9px] font-bold flex items-center justify-center">
            {{ cart().length }}
          </span>
        }
      </button>
    </header>

    <!-- Mobile Drawer Overlay -->
    @if (open()) {
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 800px:hidden animate-in fade-in duration-200"
        (click)="open.set(false)"
      >
        <div 
          class="w-[80%] max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-left duration-200"
          (click)="$event.stopPropagation()"
        >
          <div>
            <!-- Drawer Header -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span class="text-lg font-black text-gray-900">ShopO</span>
              </div>
              <button 
                type="button"
                (click)="open.set(false)"
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <app-icon name="RxCross1" [size]="16" />
              </button>
            </div>

            <!-- Drawer Search -->
            <div class="my-5 relative">
              <input
                type="search"
                placeholder="Search..."
                class="h-10 w-full pl-9 pr-3 bg-gray-50 text-sm rounded-xl border border-gray-200 outline-none focus:border-[#4f46e5]"
                [value]="searchTerm()"
                (input)="handleSearchChange($event)"
              />
              <app-icon name="AiOutlineSearch" [size]="18" class="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <!-- Mobile Navigation Links -->
            <div class="space-y-1">
              <app-navbar [active]="activeHeading" />
            </div>

            <!-- Wishlist Row -->
            <button
              type="button"
              (click)="openWishlist.set(true); open.set(false)"
              class="w-full mt-4 flex items-center justify-between p-3 rounded-xl bg-gray-50 text-gray-700 font-semibold text-xs cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <app-icon name="AiOutlineHeart" [size]="18" color="#f43f5e" />
                <span>My Wishlist</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-[#f43f5e] text-white text-[10px] font-bold">
                {{ wishlist().length }}
              </span>
            </button>
          </div>

          <!-- Drawer Footer Controls -->
          <div class="pt-6 border-t border-gray-100 space-y-3">
            <a [routerLink]="isSeller() ? '/dashboard' : '/shop-create'" (click)="open.set(false)" class="block">
              <button class="w-full h-11 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                <span>{{ isSeller() ? 'Seller Dashboard' : 'Become a Seller' }}</span>
                <app-icon name="IoIosArrowForward" [size]="14" />
              </button>
            </a>

            @if (isAuthenticated()) {
              <a routerLink="/profile" (click)="open.set(false)" class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                @if (user()?.avatar?.url) {
                  <img [src]="user()?.avatar?.url" class="w-9 h-9 rounded-full object-cover border border-gray-200" alt="" />
                } @else {
                  <div class="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-xs">
                    {{ (user()?.name || 'U').charAt(0).toUpperCase() }}
                  </div>
                }
                <div class="min-w-0">
                  <h4 class="text-xs font-bold text-gray-900 truncate">{{ user()?.name || 'Account' }}</h4>
                  <p class="text-[10px] text-gray-400 truncate">{{ user()?.email }}</p>
                </div>
              </a>
            } @else {
              <div class="grid grid-cols-2 gap-2">
                <a routerLink="/login" (click)="open.set(false)" class="h-10 border border-gray-300 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Sign In
                </a>
                <a routerLink="/sign-up" (click)="open.set(false)" class="h-10 bg-[#4f46e5] rounded-xl flex items-center justify-center text-xs font-semibold text-white hover:bg-[#4338ca]">
                  Sign Up
                </a>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Slide-over Mounts -->
    @if (openCart()) { <app-cart (closed)="openCart.set(false)" /> }
    @if (openWishlist()) { <app-wishlist (closed)="openWishlist.set(false)" /> }
  `,
})
export class HeaderComponent implements OnInit {
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

  ngOnInit() {
    if (!this.productStore.allProducts() || this.productStore.allProducts().length === 0) {
      this.productStore.getAllProducts();
    }
  }

  @HostListener('window:scroll') onScroll() {
    this.active.set(window.scrollY > 70);
  }

  handleSearchChange(e: Event) {
    const term = (e.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    if (!term.trim()) {
      this.searchData.set(null);
      return;
    }
    this.searchData.set(
        (this.productStore.allProducts() || []).filter((p) =>
            p.name.toLowerCase().includes(term.toLowerCase())
        )
    );
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchData.set(null);
  }
}