import { Component, OnInit, computed, inject } from '@angular/core';
import { AdminHeaderComponent } from '../components/layout/headers';
import { AdminSideBarComponent } from '../components/layout/sidebars';
import { DataTableComponent, GridColumn } from '../shared/data-table.component';
import { OrderStore } from '../core/state';

@Component({ selector: 'app-admin-dashboard-orders-page', standalone: true, imports: [AdminHeaderComponent, AdminSideBarComponent, DataTableComponent],
  template: `<div><app-admin-header /><div class="w-full flex"><div class="flex items-start justify-between w-full">
    <div class="w-[80px] 800px:w-[330px]"><app-admin-side-bar [active]="2" /></div>
    <div class="w-full min-h-[45vh] pt-5 rounded flex justify-center"><div class="w-[97%] flex justify-center">
      <app-data-table [rows]="row()" [columns]="columns" [pageSize]="4" /></div></div></div></div></div>` })
export class AdminDashboardOrdersPageComponent implements OnInit {
  private orderStore = inject(OrderStore);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: 'createdAt', headerName: 'Order Date', type: 'number', minWidth: 130, flex: 0.8 },
  ];
  row = computed(() => (this.orderStore.adminOrders() || []).map((i) => ({
    id: i._id, itemsQty: i?.cart?.reduce((acc, x) => acc + x.qty, 0), total: i?.totalPrice + ' $',
    status: i?.status, createdAt: i?.createdAt.slice(0, 10) })));
  ngOnInit() { this.orderStore.getAllOrdersOfAdmin(); }
}
