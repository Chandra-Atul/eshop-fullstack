import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { server } from '../../config';
import { ProductCardComponent } from '../products/product-card.component';
import { RatingsComponent } from '../products/ratings.component';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { EventStore, OrderStore, ProductStore, SellerStore } from '../../core/state';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';
import { LoaderComponent } from '../layout/loader.component';

@Component({
  selector: 'app-dashboard-hero',
  standalone: true,
  imports: [RouterLink, IconComponent, DataTableComponent],
  template: `<div class="w-full p-8">
    <h3 class="text-[22px] font-Poppins pb-2">Overview</h3>
    <div class="w-full block 800px:flex items-center justify-between">
      <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
        <div class="flex items-center"><app-icon name="AiOutlineMoneyCollect" [size]="30" class="mr-2" color="#00000085" />
          <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">Account Balance <span class="text-[16px]">(with 10% service charge)</span></h3></div>
        <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">&#36;{{ availableBalance() }}</h5>
        <a routerLink="/dashboard-withdraw-money"><h5 class="pt-4 pl-2 text-[#077f9c]">Withdraw Money</h5></a>
      </div>
      <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
        <div class="flex items-center"><app-icon name="MdBorderClear" [size]="30" class="mr-2" color="#00000085" />
          <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">All Orders</h3></div>
        <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">{{ orders().length }}</h5>
        <a routerLink="/dashboard-orders"><h5 class="pt-4 pl-2 text-[#077f9c]">View Orders</h5></a>
      </div>
      <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
        <div class="flex items-center"><app-icon name="AiOutlineMoneyCollect" [size]="30" class="mr-2" color="#00000085" />
          <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">All Products</h3></div>
        <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">{{ products().length }}</h5>
        <a routerLink="/dashboard-products"><h5 class="pt-4 pl-2 text-[#077f9c]">View Products</h5></a>
      </div>
    </div><br />
    <h3 class="text-[22px] font-Poppins pb-2">Latest Orders</h3>
    <div class="w-full min-h-[45vh] bg-white rounded"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>
  </div>`,
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
    { field: ' ', headerName: '', flex: 1, minWidth: 150, linkPrefix: '/order', icon: 'AiOutlineArrowRight' },
  ];
  row = computed(() => (this.orderStore.orders() || []).map((i) => ({ id: i._id, itemsQty: i.cart.reduce((acc, x) => acc + x.qty, 0), total: 'US$ ' + i.totalPrice, status: i.status })));
  ngOnInit() {
    const seller = this.sellerStore.seller();
    if (seller) { this.orderStore.getAllOrdersOfShop(seller._id); this.productStore.getAllProductsShop(seller._id); }
  }
}

@Component({
  selector: 'app-shop-info',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div>
      <div class="w-full py-5">
        <div class="w-full flex item-center justify-center"><img [src]="data()?.avatar?.url" alt="" class="w-[150px] h-[150px] object-cover rounded-full" /></div>
        <h3 class="text-center py-2 text-[20px]">{{ data()?.name }}</h3>
        <p class="text-[16px] text-[#000000a6] p-[10px] flex items-center">{{ data()?.description }}</p>
      </div>
      <div class="p-3"><h5 class="font-[600]">Address</h5><h4 class="text-[#000000a6]">{{ data()?.address }}</h4></div>
      <div class="p-3"><h5 class="font-[600]">Phone Number</h5><h4 class="text-[#000000a6]">{{ data()?.phoneNumber }}</h4></div>
      <div class="p-3"><h5 class="font-[600]">Total Products</h5><h4 class="text-[#000000a6]">{{ products().length }}</h4></div>
      <div class="p-3"><h5 class="font-[600]">Shop Ratings</h5><h4 class="text-[#000000b0]">{{ averageRating() }}/5</h4></div>
      <div class="p-3"><h5 class="font-[600]">Joined On</h5><h4 class="text-[#000000b0]">{{ data()?.createdAt?.slice(0, 10) }}</h4></div>
      @if (isOwner) {
        <div class="py-3 px-4">
          <a routerLink="/settings"><div class="{{ styles.button }} !w-full !h-[42px] !rounded-[5px]"><span class="text-white">Edit Shop</span></div></a>
          <div class="{{ styles.button }} !w-full !h-[42px] !rounded-[5px]" (click)="logoutHandler()"><span class="text-white">Log Out</span></div>
        </div>
      }
    </div>
  }`,
})
export class ShopInfoComponent implements OnInit {
  private productStore = inject(ProductStore);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  @Input() isOwner = false;
  styles = styles;
  data = signal<any>({});
  isLoading = signal(true);
  products = computed(() => this.productStore.products() || []);
  averageRating = computed(() => {
    const products = this.products();
    const totalReviewsLength = products.reduce((acc, p) => acc + (p.reviews?.length || 0), 0);
    const totalRatings = products.reduce((acc, p) => acc + (p.reviews || []).reduce((s, r) => s + r.rating, 0), 0);
    return totalRatings / totalReviewsLength || 0;
  });
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.productStore.getAllProductsShop(id as string);
    this.isLoading.set(true);
    try { const res: any = await this.api.get(`${server}/shop/get-shop-info/${id}`); this.data.set(res.shop); this.isLoading.set(false); }
    catch (e) { console.log(e); this.isLoading.set(false); }
  }
  async logoutHandler() { await this.api.get(`${server}/shop/logout`, true); window.location.reload(); }
}

@Component({
  selector: 'app-shop-profile-data',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, RatingsComponent],
  template: `<div class="w-full">
    <div class="flex w-full items-center justify-between">
      <div class="w-full flex">
        <div class="flex items-center" (click)="active.set(1)"><h5 class="font-[600] text-[20px] {{ active() === 1 ? 'text-red-500' : 'text-[#333]' }} cursor-pointer pr-[20px]">Shop Products</h5></div>
        <div class="flex items-center" (click)="active.set(2)"><h5 class="font-[600] text-[20px] {{ active() === 2 ? 'text-red-500' : 'text-[#333]' }} cursor-pointer pr-[20px]">Running Events</h5></div>
        <div class="flex items-center" (click)="active.set(3)"><h5 class="font-[600] text-[20px] {{ active() === 3 ? 'text-red-500' : 'text-[#333]' }} cursor-pointer pr-[20px]">Shop Reviews</h5></div>
      </div>
      <div>@if (isOwner) { <a routerLink="/dashboard"><div class="{{ styles.button }} !rounded-[4px] h-[42px]"><span class="text-[#fff]">Go Dashboard</span></div></a> }</div>
    </div><br />
    @if (active() === 1) {
      <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
        @for (i of products(); track i._id) { <app-product-card [data]="i" /> }
      </div>
    }
    @if (active() === 2) {
      <div class="w-full">
        <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
          @for (i of events(); track i._id) { <app-product-card [data]="$any(i)" [isEvent]="true" /> }
        </div>
        @if (events().length === 0) { <h5 class="w-full text-center py-5 text-[18px]">No Events have for this shop!</h5> }
      </div>
    }
    @if (active() === 3) {
      <div class="w-full">
        @for (item of allReviews(); track $index) {
          <div class="w-full flex my-4"><img [src]="item.user.avatar?.url" class="w-[50px] h-[50px] rounded-full" alt="" />
            <div class="pl-2"><div class="flex w-full items-center"><h1 class="font-[600] pr-2">{{ item.user.name }}</h1><app-ratings [rating]="item.rating" /></div>
              <p class="font-[400] text-[#000000a7]">{{ item?.comment }}</p><p class="text-[#000000a7] text-[14px]">2days ago</p></div></div>
        }
        @if (allReviews().length === 0) { <h5 class="w-full text-center py-5 text-[18px]">No Reviews have for this shop!</h5> }
      </div>
    }
  </div>`,
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
  allReviews = computed(() => (this.productStore.products() || []).map((p) => p.reviews || []).flat() as any[]);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.productStore.getAllProductsShop(id as string);
    this.eventStore.getAllEventsShop(id as string);
  }
}
