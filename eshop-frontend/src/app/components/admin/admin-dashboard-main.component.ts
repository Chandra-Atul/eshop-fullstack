import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { OrderStore, SellerStore } from '../../core/state';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';
import { LoaderComponent } from '../layout/loader.component';

@Component({
  selector: 'app-admin-dashboard-main',
  standalone: true,
  imports: [RouterLink, IconComponent, DataTableComponent, LoaderComponent],
  template: `@if (adminOrderLoading()) { <app-loader /> } @else {
    <div class="w-full p-4">
      <h3 class="text-[22px] font-Poppins pb-2">Overview</h3>
      <div class="w-full block 800px:flex items-center justify-between">
        <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
          <div class="flex items-center"><app-icon name="AiOutlineMoneyCollect" [size]="30" class="mr-2" color="#00000085" />
            <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">Total Earning</h3></div>
          <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">&#36; {{ adminBalance() }}</h5>
        </div>
        <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
          <div class="flex items-center"><app-icon name="MdBorderClear" [size]="30" class="mr-2" color="#00000085" />
            <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">All Sellers</h3></div>
          <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">{{ sellers().length }}</h5>
          <a routerLink="/admin-sellers"><h5 class="pt-4 pl-2 text-[#077f9c]">View Sellers</h5></a>
        </div>
        <div class="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
          <div class="flex items-center"><app-icon name="AiOutlineMoneyCollect" [size]="30" class="mr-2" color="#00000085" />
            <h3 class="{{ styles.productTitle }} !text-[18px] leading-5 !font-[400] text-[#00000085]">All Orders</h3></div>
          <h5 class="pt-2 pl-[36px] text-[22px] font-[500]">{{ adminOrders().length }}</h5>
          <a routerLink="/admin-orders"><h5 class="pt-4 pl-2 text-[#077f9c]">View Orders</h5></a>
        </div>
      </div>
      <br /><h3 class="text-[22px] font-Poppins pb-2">Latest Orders</h3>
      <div class="w-full min-h-[45vh] bg-white rounded"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="4" /></div>
    </div>
  }`,
})
export class AdminDashboardMainComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);
  styles = styles;
  adminOrders = computed(() => this.orderStore.adminOrders() || []);
  adminOrderLoading = computed(() => this.orderStore.adminOrderLoading());
  sellers = computed(() => this.sellerStore.sellers() || []);
  adminBalance = computed(() => (this.orderStore.adminOrders() || []).reduce((acc, i) => acc + i.totalPrice * 0.1, 0).toFixed(2));
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: 'createdAt', headerName: 'Order Date', type: 'number', minWidth: 130, flex: 0.8 },
  ];
  row = computed(() => (this.orderStore.adminOrders() || []).map((item) => ({
    id: item._id, itemsQty: item?.cart?.reduce((acc, i) => acc + i.qty, 0),
    total: item?.totalPrice + ' $', status: item?.status, createdAt: item?.createdAt.slice(0, 10),
  })));
  ngOnInit() { this.orderStore.getAllOrdersOfAdmin(); this.sellerStore.getAllSellers(); }
}
