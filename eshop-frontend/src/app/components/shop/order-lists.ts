import { Component, OnInit, computed, inject } from '@angular/core';
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

const toRow = (orders: any[]) => orders.map((i) => ({ id: i._id, itemsQty: i.cart.length, total: 'US$ ' + i.totalPrice, status: i.status }));

@Component({
  selector: 'app-shop-all-orders',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>
  }`,
})
export class ShopAllOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);
  columns = COLUMNS;
  isLoading = computed(() => this.orderStore.isLoading());
  row = computed(() => toRow(this.orderStore.orders() || []));
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.orderStore.getAllOrdersOfShop(s._id); }
}

@Component({
  selector: 'app-shop-all-refund-orders',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>
  }`,
})
export class ShopAllRefundOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);
  columns = COLUMNS;
  isLoading = computed(() => this.orderStore.isLoading());
  row = computed(() => toRow((this.orderStore.orders() || []).filter((i) => i.status === 'Processing refund' || i.status === 'Refund Success')));
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.orderStore.getAllOrdersOfShop(s._id); }
}
