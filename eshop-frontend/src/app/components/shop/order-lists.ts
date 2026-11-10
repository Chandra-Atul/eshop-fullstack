import { Component, OnInit, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { LoaderComponent } from '../layout/loader.component';
import { OrderStore, SellerStore } from '../../core/state';

// ==========================================
// 1. SHOP ALL ORDERS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-orders',
  standalone: true,
  imports: [RouterLink, IconComponent, LoaderComponent],
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full mx-8 pt-1 mt-10 bg-white shadow-sm rounded-lg p-4 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-800">All Orders</h3>
          <span class="text-sm text-gray-500">Total: {{ orders().length }}</span>
        </div>

        @if (orders().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th class="py-3 px-4">Order ID</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Items Qty</th>
                  <th class="py-3 px-4">Total</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (order of orders(); track (order.id || order._id)) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">
                      #{{ order.id || order._id }}
                    </td>
                    <td class="py-3 px-4">
                      <span 
                        class="px-2.5 py-1 rounded-full text-xs font-semibold inline-block"
                        [class.bg-green-100]="order.status === 'Delivered' || order.status === 'Succeeded'"
                        [class.text-green-700]="order.status === 'Delivered' || order.status === 'Succeeded'"
                        [class.bg-yellow-100]="order.status === 'Processing' || !order.status"
                        [class.text-yellow-700]="order.status === 'Processing' || !order.status"
                        [class.bg-red-100]="order.status === 'Refund Success' || order.status === 'Cancelled'"
                        [class.text-red-700]="order.status === 'Refund Success' || order.status === 'Cancelled'"
                      >
                        {{ order.status || 'Processing' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-gray-600">
                      {{ getItemCount(order) }}
                    </td>
                    <td class="py-3 px-4 font-semibold text-gray-900">
                      ₹ {{ order.totalPrice ?? 0 }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <a 
                        [routerLink]="['/order', order.id || order._id]"
                        class="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-medium"
                      >
                        Details
                        <app-icon name="AiOutlineArrowRight" [size]="16" />
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="py-12 text-center">
            <h4 class="text-gray-600 font-medium text-base">No orders found for this shop</h4>
            <p class="text-sm text-gray-400 mt-1">Orders placed for your products will show up here.</p>
          </div>
        }
      </div>
    }
  `,
})
export class ShopAllOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);

  isLoading = computed(() => this.orderStore.isLoading());
  orders = computed(() => this.orderStore.orders() || []);

  constructor() {
    effect(
        () => {
          const seller: any = this.sellerStore.seller();
          const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
          if (shopId && shopId !== 'undefined') {
            this.orderStore.getAllOrdersOfShop(shopId);
          }
        },
        { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    const seller: any = this.sellerStore.seller();
    const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
    if (shopId && shopId !== 'undefined') {
      this.orderStore.getAllOrdersOfShop(shopId);
    }
  }

  getItemCount(order: any): number {
    return (order?.cart || []).reduce(
        (acc: number, x: any) => acc + Number(x.qty || x.quantity || 1),
        0
    );
  }
}

// ==========================================
// 2. SHOP ALL REFUND ORDERS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-refund-orders',
  standalone: true,
  imports: [RouterLink, IconComponent, LoaderComponent],
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full mx-8 pt-1 mt-10 bg-white shadow-sm rounded-lg p-4 border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-800">Refund Requests</h3>
          <span class="text-sm text-gray-500">Total: {{ refundOrders().length }}</span>
        </div>

        @if (refundOrders().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th class="py-3 px-4">Order ID</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Items Qty</th>
                  <th class="py-3 px-4">Total</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                @for (order of refundOrders(); track (order.id || order._id)) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4 font-medium text-gray-800">
                      #{{ order.id || order._id }}
                    </td>
                    <td class="py-3 px-4">
                      <span 
                        class="px-2.5 py-1 rounded-full text-xs font-semibold inline-block"
                        [class.bg-amber-100]="order.status === 'Processing refund'"
                        [class.text-amber-700]="order.status === 'Processing refund'"
                        [class.bg-green-100]="order.status === 'Refund Success'"
                        [class.text-green-700]="order.status === 'Refund Success'"
                      >
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-gray-600">
                      {{ getItemCount(order) }}
                    </td>
                    <td class="py-3 px-4 font-semibold text-gray-900">
                      ₹ {{ order.totalPrice ?? 0 }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <a 
                        [routerLink]="['/order', order.id || order._id]"
                        class="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-medium"
                      >
                        Review
                        <app-icon name="AiOutlineArrowRight" [size]="16" />
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="py-12 text-center">
            <h4 class="text-gray-600 font-medium text-base">No refund requests</h4>
            <p class="text-sm text-gray-400 mt-1">Orders with refund requests will appear here.</p>
          </div>
        }
      </div>
    }
  `,
})
export class ShopAllRefundOrdersComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);

  isLoading = computed(() => this.orderStore.isLoading());

  refundOrders = computed(() =>
      (this.orderStore.orders() || []).filter(
          (i: any) => i.status === 'Processing refund' || i.status === 'Refund Success'
      )
  );

  constructor() {
    effect(
        () => {
          const seller: any = this.sellerStore.seller();
          const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
          if (shopId && shopId !== 'undefined') {
            this.orderStore.getAllOrdersOfShop(shopId);
          }
        },
        { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    const seller: any = this.sellerStore.seller();
    const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
    if (shopId && shopId !== 'undefined') {
      this.orderStore.getAllOrdersOfShop(shopId);
    }
  }

  getItemCount(order: any): number {
    return (order?.cart || []).reduce(
        (acc: number, x: any) => acc + Number(x.qty || x.quantity || 1),
        0
    );
  }
}