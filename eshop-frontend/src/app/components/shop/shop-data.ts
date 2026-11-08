import { Component, Input, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { server } from '../../config';
import { ProductCardComponent } from '../products/product-card.component';
import { RatingsComponent } from '../products/ratings.component';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { EventStore, OrderStore, ProductStore, SellerStore } from '../../core/state';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';
import { LoaderComponent } from '../layout/loader.component';
import { ToastService } from '../../core/toast.service';

// ==========================================
// 1. DASHBOARD HERO COMPONENT
// ==========================================
@Component({
  selector: 'app-dashboard-hero',
  standalone: true,
  imports: [RouterLink, IconComponent, DataTableComponent],
  template: `
    <div class="w-full p-8">
      <h3 class="text-[22px] font-Poppins pb-2 text-gray-800 font-semibold">Overview</h3>

      <div class="w-full block 800px:flex items-center justify-between gap-4">
        <!-- Account Balance Card -->
        <div class="w-full mb-4 800px:w-[32%] min-h-[20vh] bg-white shadow-sm rounded-lg px-4 py-5 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="flex items-center">
              <app-icon name="AiOutlineMoneyCollect" [size]="28" class="mr-2" color="#00000085" />
              <h3 class="{{ styles.productTitle }} !text-[16px] leading-5 !font-[500] text-[#00000085]">
                Account Balance <span class="text-[13px] text-gray-400 font-normal">(with 10% fee)</span>
              </h3>
            </div>
            <h5 class="pt-2 pl-[36px] text-[24px] font-[600] text-gray-900">&#36;{{ availableBalance() }}</h5>
          </div>
          <a routerLink="/dashboard-withdraw-money">
            <h5 class="pt-4 pl-2 text-[#077f9c] hover:underline font-medium text-sm">Withdraw Money &rarr;</h5>
          </a>
        </div>

        <!-- Orders Card -->
        <div class="w-full mb-4 800px:w-[32%] min-h-[20vh] bg-white shadow-sm rounded-lg px-4 py-5 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="flex items-center">
              <app-icon name="MdBorderClear" [size]="28" class="mr-2" color="#00000085" />
              <h3 class="{{ styles.productTitle }} !text-[16px] leading-5 !font-[500] text-[#00000085]">All Orders</h3>
            </div>
            <h5 class="pt-2 pl-[36px] text-[24px] font-[600] text-gray-900">{{ orders().length }}</h5>
          </div>
          <a routerLink="/dashboard-orders">
            <h5 class="pt-4 pl-2 text-[#077f9c] hover:underline font-medium text-sm">View Orders &rarr;</h5>
          </a>
        </div>

        <!-- Products Card -->
        <div class="w-full mb-4 800px:w-[32%] min-h-[20vh] bg-white shadow-sm rounded-lg px-4 py-5 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="flex items-center">
              <app-icon name="FiShoppingBag" [size]="28" class="mr-2" color="#00000085" />
              <h3 class="{{ styles.productTitle }} !text-[16px] leading-5 !font-[500] text-[#00000085]">All Products</h3>
            </div>
            <h5 class="pt-2 pl-[36px] text-[24px] font-[600] text-gray-900">{{ products().length }}</h5>
          </div>
          <a routerLink="/dashboard-products">
            <h5 class="pt-4 pl-2 text-[#077f9c] hover:underline font-medium text-sm">View Products &rarr;</h5>
          </a>
        </div>
      </div>

      <br />
      <h3 class="text-[20px] font-Poppins pb-2 text-gray-800 font-semibold">Latest Orders</h3>
      <div class="w-full min-h-[45vh] bg-white rounded-lg shadow-sm border border-gray-100 p-2">
        <app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" />
      </div>
    </div>
  `,
})
export class DashboardHeroComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);

  styles = styles;
  orders = computed(() => this.orderStore.orders() || []);
  products = computed(() => this.productStore.products() || []);
  availableBalance = computed(() => (this.sellerStore.seller()?.availableBalance ?? 0).toFixed(2));

  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: ' ', headerName: '', flex: 0.6, minWidth: 100, linkPrefix: '/order', icon: 'AiOutlineArrowRight' },
  ];

  row = computed(() =>
      (this.orderStore.orders() || []).map((i) => ({
        id: i._id,
        itemsQty: (i.cart || []).reduce((acc, x) => acc + (x.qty || (x as any).quantity || 1), 0),
        total: 'US$ ' + (i.totalPrice ?? 0),
        status: i.status || 'Processing',
      }))
  );

  constructor() {
    // Watches seller state and fetches products/orders whenever seller resolves
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller?._id) {
        this.orderStore.getAllOrdersOfShop(seller._id);
        this.productStore.getAllProductsShop(seller._id);
      }
    });
  }

  ngOnInit() {
    const seller = this.sellerStore.seller();
    if (seller?._id) {
      this.orderStore.getAllOrdersOfShop(seller._id);
      this.productStore.getAllProductsShop(seller._id);
    }
  }
}

// ==========================================
// 2. SHOP INFO COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-info',
  standalone: true,
  imports: [RouterLink, LoaderComponent, IconComponent],
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div class="w-full py-5 text-center">
          <div class="w-full flex items-center justify-center">
            @if (data()?.avatar?.url) {
              <img [src]="data()?.avatar?.url" alt="Shop Avatar" class="w-[130px] h-[130px] object-cover rounded-full border-2 border-gray-100 shadow-sm" />
            } @else {
              <app-icon name="RxAvatar" [size]="130" color="#888" />
            }
          </div>
          <h3 class="py-2 text-[20px] font-semibold text-gray-900">{{ data()?.name }}</h3>
          <p class="text-[14px] text-gray-500 px-4 leading-relaxed">{{ data()?.description || 'No description provided.' }}</p>
        </div>

        <div class="border-t border-gray-100 divide-y divide-gray-50 text-sm">
          <div class="py-2.5 flex justify-between">
            <h5 class="font-medium text-gray-700">Address</h5>
            <h4 class="text-gray-500 text-right">{{ data()?.address || 'N/A' }}</h4>
          </div>
          <div class="py-2.5 flex justify-between">
            <h5 class="font-medium text-gray-700">Phone Number</h5>
            <h4 class="text-gray-500">{{ data()?.phoneNumber || 'N/A' }}</h4>
          </div>
          <div class="py-2.5 flex justify-between">
            <h5 class="font-medium text-gray-700">Total Products</h5>
            <h4 class="text-gray-500">{{ products().length }}</h4>
          </div>
          <div class="py-2.5 flex justify-between">
            <h5 class="font-medium text-gray-700">Shop Ratings</h5>
            <h4 class="text-gray-500 font-semibold">{{ averageRating() }}/5</h4>
          </div>
          <div class="py-2.5 flex justify-between">
            <h5 class="font-medium text-gray-700">Joined On</h5>
            <h4 class="text-gray-500">{{ data()?.createdAt?.slice(0, 10) || 'N/A' }}</h4>
          </div>
        </div>

        @if (isOwner) {
          <div class="pt-5 space-y-2">
            <a routerLink="/settings" class="block">
              <div class="{{ styles.button }} !w-full !h-[42px] !rounded-[5px]">
                <span class="text-white text-sm font-medium">Edit Shop</span>
              </div>
            </a>
            <button
              type="button"
              (click)="logoutHandler()"
              class="w-full h-[42px] rounded-[5px] bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors cursor-pointer border border-red-200 text-sm"
            >
              Log Out
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class ShopInfoComponent implements OnInit {
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  @Input() isOwner = false;
  styles = styles;
  data = signal<any>({});
  isLoading = signal(true);
  products = computed(() => this.productStore.products() || []);

  averageRating = computed(() => {
    const products = this.products();
    const allReviews = products.flatMap((p) => p.reviews || []);
    if (!allReviews.length) return '0.0';
    const total = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / allReviews.length).toFixed(1);
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.productStore.getAllProductsShop(id);
    this.isLoading.set(true);
    try {
      const res: any = await this.api.get(`${server}/shop/get-shop-info/${id}`);
      this.data.set(res?.shop || {});
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async logoutHandler() {
    try {
      await this.api.get(`${server}/shop/logout`, true);
    } catch (e) {
      console.warn('Logout API call failed, clearing local session anyway.');
    }

    localStorage.removeItem('seller_token');
    this.sellerStore.seller.set(null);
    this.sellerStore.isSeller.set(false);
    this.toast.success('Logged out successfully!');
    this.router.navigate(['/shop-login']);
  }
}

// ==========================================
// 3. SHOP PROFILE DATA COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-profile-data',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, RatingsComponent, IconComponent],
  template: `
    <div class="w-full">
      <div class="flex w-full items-center justify-between pb-4 border-b border-gray-100">
        <div class="flex space-x-6">
          <div (click)="active.set(1)" class="cursor-pointer">
            <h5 class="font-[600] text-[18px] transition-colors pb-1 border-b-2"
                [class.text-red-500]="active() === 1"
                [class.border-red-500]="active() === 1"
                [class.border-transparent]="active() !== 1"
                [class.text-gray-600]="active() !== 1">
              Shop Products
            </h5>
          </div>

          <div (click)="active.set(2)" class="cursor-pointer">
            <h5 class="font-[600] text-[18px] transition-colors pb-1 border-b-2"
                [class.text-red-500]="active() === 2"
                [class.border-red-500]="active() === 2"
                [class.border-transparent]="active() !== 2"
                [class.text-gray-600]="active() !== 2">
              Running Events
            </h5>
          </div>

          <div (click)="active.set(3)" class="cursor-pointer">
            <h5 class="font-[600] text-[18px] transition-colors pb-1 border-b-2"
                [class.text-red-500]="active() === 3"
                [class.border-red-500]="active() === 3"
                [class.border-transparent]="active() !== 3"
                [class.text-gray-600]="active() !== 3">
              Shop Reviews
            </h5>
          </div>
        </div>

        @if (isOwner) {
          <a routerLink="/dashboard">
            <div class="{{ styles.button }} !rounded-[4px] !h-[40px] px-4">
              <span class="text-white text-sm font-medium">Go Dashboard</span>
            </div>
          </a>
        }
      </div>

      <div class="pt-6">
        <!-- Tab 1: Products -->
        @if (active() === 1) {
          <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12">
            @for (i of products(); track i._id) {
              <app-product-card [data]="i" />
            }
          </div>
          @if (products().length === 0) {
            <h5 class="w-full text-center py-10 text-[16px] text-gray-400">No products found for this shop!</h5>
          }
        }

        <!-- Tab 2: Events -->
        @if (active() === 2) {
          <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12">
            @for (i of events(); track i._id) {
              <app-product-card [data]="$any(i)" [isEvent]="true" />
            }
          </div>
          @if (events().length === 0) {
            <h5 class="w-full text-center py-10 text-[16px] text-gray-400">No running events for this shop!</h5>
          }
        }

        <!-- Tab 3: Reviews -->
        @if (active() === 3) {
          <div class="w-full space-y-4">
            @for (item of allReviews(); track $index) {
              <div class="w-full flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                @if (item?.user?.avatar?.url) {
                  <img [src]="item.user.avatar.url" class="w-[45px] h-[45px] rounded-full object-cover mr-3 border" alt="User avatar" />
                } @else {
                  <app-icon name="RxAvatar" [size]="45" class="mr-3" color="#888" />
                }

                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <h1 class="font-semibold text-gray-800">{{ item?.user?.name || 'Customer' }}</h1>
                    <app-ratings [rating]="item?.rating || 5" />
                  </div>
                  <p class="text-gray-600 text-sm mt-1 leading-relaxed">{{ item?.comment }}</p>
                  <p class="text-gray-400 text-xs mt-2">{{ item?.createdAt?.slice(0, 10) || 'Recent' }}</p>
                </div>
              </div>
            }

            @if (allReviews().length === 0) {
              <h5 class="w-full text-center py-10 text-[16px] text-gray-400">No reviews found for this shop!</h5>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ShopProfileDataComponent implements OnInit {
  private productStore = inject(ProductStore);
  private eventStore = inject(EventStore);
  private route = inject(ActivatedRoute);

  @Input() isOwner = false;
  styles = styles;
  active = signal(1);

  products = computed(() => this.productStore.products() || []);
  events = computed(() => this.eventStore.events() || []);
  allReviews = computed(() => (this.productStore.products() || []).flatMap((p) => p.reviews || []));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productStore.getAllProductsShop(id);
      this.eventStore.getAllEventsShop(id);
    }
  }
}