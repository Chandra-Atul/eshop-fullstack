import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { OrderStore, SellerStore } from '../../core/state';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';

@Component({
  selector: 'app-shop-order-details',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="py-6 min-h-screen {{ styles.section }}">
      <!-- Top Bar -->
      <div class="w-full flex items-center justify-between">
        <div class="flex items-center">
          <app-icon name="BsFillBagFill" [size]="28" color="crimson" />
          <h1 class="pl-2 text-[24px] font-semibold text-gray-800">Order Details</h1>
        </div>
        <a routerLink="/dashboard-orders">
          <div class="{{ styles.button }} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[42px] px-4 text-[16px]">
            Order List
          </div>
        </a>
      </div>

      <!-- Order Summary Header -->
      <div class="w-full flex items-center justify-between pt-6 border-b pb-4">
        <h5 class="text-gray-500 text-sm">
          Order ID: <span class="font-mono font-medium text-gray-800">#{{ orderId()?.slice(0, 8) }}</span>
        </h5>
        <h5 class="text-gray-500 text-sm">
          Placed on: <span class="font-medium text-gray-800">{{ data()?.createdAt?.slice(0, 10) || 'N/A' }}</span>
        </h5>
      </div>

      <!-- Items in Order -->
      <div class="py-6 space-y-4">
        @if (data() && data()!.cart) {
          @for (item of data()!.cart; track (item._id || $index)) {
            <div class="w-full flex items-center justify-between border-b pb-4">
              <div class="flex items-center">
                <img
                  [src]="item?.images && item.images[0]?.url ? item.images[0].url : 'https://via.placeholder.com/80'"
                  alt="Product image"
                  class="w-[75px] h-[75px] object-cover rounded border"
                />
                <div class="pl-4">
                  <h5 class="text-[18px] font-medium text-gray-800">{{ item?.name }}</h5>
                  <h5 class="text-[16px] text-gray-500 mt-1">
                    US&#36;{{ item?.discountPrice }} &times; {{ item?.qty || 1 }}
                  </h5>
                </div>
              </div>
              <h5 class="text-lg font-semibold text-gray-700">
                US&#36;{{ ((item?.discountPrice || 0) * (item?.qty || 1)).toFixed(2) }}
              </h5>
            </div>
          }
        } @else {
          <div class="py-10 text-center text-gray-400">Loading order items...</div>
        }
      </div>

      <!-- Total -->
      <div class="border-t w-full text-right py-3">
        <h5 class="text-[20px] text-gray-800">
          Total Price: <strong class="text-red-600 font-bold">US&#36;{{ data()?.totalPrice }}</strong>
        </h5>
      </div>

      <!-- Shipping & Payment Section -->
      <div class="w-full 800px:flex items-start justify-between bg-gray-50 p-6 rounded-lg my-6 gap-6">
        <div class="w-full 800px:w-[60%]">
          <h4 class="text-[18px] font-semibold text-gray-800 mb-2">Shipping Address:</h4>
          <p class="text-gray-600 text-base leading-relaxed">
            {{ data()?.shippingAddress?.address1 }} {{ data()?.shippingAddress?.address2 }}<br />
            {{ data()?.shippingAddress?.city }}, {{ data()?.shippingAddress?.country }}<br />
            <span class="font-medium text-gray-700">Phone: </span>{{ data()?.user?.phoneNumber || 'N/A' }}
          </p>
        </div>

        <div class="w-full 800px:w-[40%] mt-4 800px:mt-0">
          <h4 class="text-[18px] font-semibold text-gray-800 mb-2">Payment Info:</h4>
          <p class="text-gray-600 text-base">
            <span class="font-medium text-gray-700">Status: </span>
            <span [class.text-green-600]="data()?.paymentInfo?.status === 'Succeeded'"
                  [class.text-amber-600]="data()?.paymentInfo?.status !== 'Succeeded'">
              {{ data()?.paymentInfo?.status || 'Not Paid' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Status Update Section -->
      <div class="bg-white p-6 border rounded-lg shadow-sm">
        <h4 class="text-[18px] font-semibold text-gray-800">Order Status:</h4>
        <p class="text-sm text-gray-500 mb-3">
          Current status: <span class="font-semibold text-blue-600">{{ data()?.status }}</span>
        </p>

        @if (data()?.status !== 'Processing refund' && data()?.status !== 'Refund Success') {
          <select
            [value]="status()"
            (change)="status.set($any($event.target).value)"
            class="w-[260px] border border-gray-300 h-[40px] px-3 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            @for (option of orderStatusOptions(); track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        } @else {
          <select
            [value]="status()"
            (change)="status.set($any($event.target).value)"
            class="w-[260px] border border-gray-300 h-[40px] px-3 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            @for (option of refundStatusOptions(); track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        }

        <div class="mt-5">
          <button
            type="button"
            [disabled]="isUpdating() || !status()"
            (click)="handleStatusUpdate()"
            class="h-[42px] px-6 bg-[#fce1e6] hover:bg-[#fad2da] text-[#e94560] font-[600] rounded-[4px] text-[15px] cursor-pointer transition-colors disabled:opacity-50"
          >
            {{ isUpdating() ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ShopOrderDetailsComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private sellerStore = inject(SellerStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  styles = styles;
  status = signal('');
  isUpdating = signal(false);

  orderId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  data = computed(() =>
      (this.orderStore.orders() || []).find((i) => i._id === this.orderId())
  );

  orderStatusOptions = computed(() => {
    const all = ['Processing', 'Transferred to delivery partner', 'Shipping', 'Received', 'On the way', 'Delivered'];
    const current = this.data()?.status;
    const idx = current ? all.indexOf(current) : 0;
    return all.slice(idx === -1 ? 0 : idx);
  });

  refundStatusOptions = computed(() => {
    const all = ['Processing refund', 'Refund Success'];
    const current = this.data()?.status;
    const idx = current ? all.indexOf(current) : 0;
    return all.slice(idx === -1 ? 0 : idx);
  });

  constructor() {
    // 1. Reactive check: fetch shop orders as soon as seller resolves
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller?._id && (!this.orderStore.orders() || this.orderStore.orders().length === 0)) {
        this.orderStore.getAllOrdersOfShop(seller._id);
      }
    });

    // 2. Synchronize selected dropdown status whenever order data becomes available
    effect(() => {
      const currentOrder = this.data();
      if (currentOrder?.status && !this.status()) {
        this.status.set(currentOrder.status);
      }
    });
  }

  async ngOnInit() {
    const seller = this.sellerStore.seller();
    if (seller?._id) {
      this.orderStore.getAllOrdersOfShop(seller._id);
    }
  }

  async handleStatusUpdate() {
    const id = this.orderId();
    const currentStatus = this.data()?.status;
    const newStatus = this.status();

    if (!newStatus) {
      this.toast.error('Please choose a valid status.');
      return;
    }

    this.isUpdating.set(true);

    try {
      if (currentStatus === 'Processing refund' || newStatus === 'Refund Success') {
        await this.api.put(`${server}/order/order-refund-success/${id}`, { status: newStatus }, true);
      } else {
        await this.api.put(`${server}/order/update-order-status/${id}`, { status: newStatus }, true);
      }

      this.toast.success('Order status updated successfully!');

      // Re-fetch orders for the current seller to synchronize store
      const seller = this.sellerStore.seller();
      if (seller?._id) {
        await this.orderStore.getAllOrdersOfShop(seller._id);
      }

      this.router.navigate(['/dashboard-orders']);
    } catch (e: any) {
      this.toast.error(this.api.message(e));
    } finally {
      this.isUpdating.set(false);
    }
  }
}