import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';
import { LoaderComponent } from '../layout/loader.component';
import { OrderStore, SellerStore } from '../../core/state';

const COLUMNS: GridColumn[] = [
  { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
  { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
  { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
  { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
  { field: ' ', headerName: '', flex: 1, minWidth: 150, linkPrefix: '/order', icon: 'AiOutlineArrowRight' },
];

const toRow = (orders: any[]) =>
    orders.map((i) => ({
      id: i._id,
      itemsQty: (i.cart || []).reduce((acc: number, x: any) => acc + (x.qty || x.quantity || 1), 0),
      total: 'US$ ' + (i.totalPrice ?? 0),
      status: i.status || 'Processing',
    }));

// ==========================================
// 1. SHOP ALL ORDERS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-orders',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full mx-8 pt-1 mt-10 bg-white shadow-sm rounded-lg p-2">
        <app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" />
      </div>
    }
  `,
})
export class ShopAllOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);

  columns = COLUMNS;
  isLoading = computed(() => this.orderStore.isLoading());
  row = computed(() => toRow(this.orderStore.orders() || []));

  constructor() {
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller?._id) {
        this.orderStore.getAllOrdersOfShop(seller._id);
      }
    });
  }

  ngOnInit() {
    const seller = this.sellerStore.seller();
    if (seller?._id) {
      this.orderStore.getAllOrdersOfShop(seller._id);
    }
  }
}

// ==========================================
// 2. SHOP ALL REFUND ORDERS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-refund-orders',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full mx-8 pt-1 mt-10 bg-white shadow-sm rounded-lg p-2">
        <app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" />
      </div>
    }
  `,
})
export class ShopAllRefundOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);

  columns = COLUMNS;
  isLoading = computed(() => this.orderStore.isLoading());
  row = computed(() =>
      toRow(
          (this.orderStore.orders() || []).filter(
              (i) => i.status === 'Processing refund' || i.status === 'Refund Success'
          )
      )
  );

  constructor() {
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller?._id) {
        this.orderStore.getAllOrdersOfShop(seller._id);
      }
    });
  }

  ngOnInit() {
    const seller = this.sellerStore.seller();
    if (seller?._id) {
      this.orderStore.getAllOrdersOfShop(seller._id);
    }
  }
}