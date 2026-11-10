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
    <div class="min-h-screen bg-[#f8fafc] py-8 px-4 800px:px-10">
      <div class="max-w-6xl mx-auto">
        
        <!-- Header bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-[#e94560] shadow-sm">
              <app-icon name="BsFillBagFill" [size]="22" />
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900">Order #{{ orderId() }}</h1>
                <span 
                  class="px-3 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"
                  [class.bg-blue-50]="data()?.status === 'Processing'"
                  [class.text-blue-700]="data()?.status === 'Processing'"
                  [class.border-blue-200]="data()?.status === 'Processing'"
                  [class.bg-emerald-50]="data()?.status === 'Delivered' || data()?.status === 'Succeeded'"
                  [class.text-emerald-700]="data()?.status === 'Delivered' || data()?.status === 'Succeeded'"
                  [class.bg-amber-50]="data()?.status === 'Shipping' || data()?.status === 'On the way'"
                  [class.text-amber-700]="data()?.status === 'Shipping' || data()?.status === 'On the way'"
                  [class.bg-rose-50]="data()?.status === 'Processing refund' || data()?.status === 'Refund Success'"
                  [class.text-rose-700]="data()?.status === 'Processing refund' || data()?.status === 'Refund Success'"
                  class="border"
                >
                  {{ data()?.status || 'Processing' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Placed on {{ orderCreatedAt() }}</p>
            </div>
          </div>

          <a routerLink="/dashboard-orders">
            <button class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium text-sm rounded-lg shadow-sm transition-all">
              <app-icon name="AiOutlineArrowRight" class="rotate-180" [size]="14" />
              Back to Order List
            </button>
          </a>
        </div>

        <!-- Main 2-Column Content Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left 2 Cols: Items & Financial Breakdown -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Items Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-base font-semibold text-gray-900">Items Ordered</h2>
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {{ data()?.cart?.length || 0 }} {{ (data()?.cart?.length === 1) ? 'item' : 'items' }}
                </span>
              </div>

              <div class="p-6 divide-y divide-gray-100">
                @if (data() && data()!.cart && data()!.cart.length > 0) {
                  @for (item of data()!.cart; track (item.id || item._id || $index)) {
                    <div class="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div class="w-20 h-20 shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
                        <img
                          [src]="getItemImage(item)"
                          [alt]="item?.name"
                          class="w-full h-full object-cover"
                        />
                      </div>

                      <div class="flex-1 min-w-0">
                        <h3 class="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {{ item?.name }}
                        </h3>
                        <p class="text-xs text-gray-500 mt-1">
                          Product ID: <span class="font-mono text-gray-700">#{{ item?.productId }}</span>
                        </p>
                        <div class="text-xs text-gray-600 mt-1 font-medium">
                          ₹{{ item?.discountPrice ?? item?.price ?? 0 }} × {{ item?.qty || 1 }}
                        </div>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-base font-bold text-gray-900">
                          ₹{{ (((item?.discountPrice ?? item?.price ?? 0) * (item?.qty || 1))).toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="py-12 text-center text-gray-400 text-sm">No items found for this order.</div>
                }
              </div>

              <!-- Order Totals -->
              <div class="bg-gray-50/70 p-6 border-t border-gray-100 space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span class="font-medium text-gray-900">₹{{ data()?.totalPrice ?? 0 }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Estimated Shipping</span>
                  <span class="text-emerald-600 font-medium">Free</span>
                </div>
                <div class="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span class="text-base font-bold text-gray-900">Total Price</span>
                  <span class="text-xl font-extrabold text-[#e94560]">₹{{ data()?.totalPrice ?? 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Manage Order Status Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-base font-semibold text-gray-900 mb-1">Update Order Status</h2>
              <p class="text-xs text-gray-500 mb-4">Advance the order through its fulfillment lifecycle.</p>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div class="relative flex-1">
                  @if (data()?.status !== 'Processing refund' && data()?.status !== 'Refund Success') {
                    <select
                      [value]="status()"
                      (change)="status.set($any($event.target).value)"
                      class="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560]"
                    >
                      @for (option of orderStatusOptions(); track option) {
                        <option [value]="option">{{ option }}</option>
                      }
                    </select>
                  } @else {
                    <select
                      [value]="status()"
                      (change)="status.set($any($event.target).value)"
                      class="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560]"
                    >
                      @for (option of refundStatusOptions(); track option) {
                        <option [value]="option">{{ option }}</option>
                      }
                    </select>
                  }
                </div>

                <button
                  type="button"
                  [disabled]="isUpdating() || !status()"
                  (click)="handleStatusUpdate()"
                  class="h-11 px-6 bg-[#e94560] hover:bg-[#d63853] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {{ isUpdating() ? 'Updating...' : 'Update Status' }}
                </button>
              </div>
            </div>

          </div>

          <!-- Right 1 Col: Customer, Shipping & Payment Summary -->
          <div class="space-y-6">

            <!-- Customer & Shipping Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer & Shipping</h3>
              
              <div class="flex items-start gap-3 pb-4 border-b border-gray-100">
                <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ (data()?.userName || 'C').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 truncate">{{ data()?.userName || 'Customer' }}</h4>
                  <p class="text-xs text-gray-500 truncate">{{ data()?.userEmail || 'N/A' }}</p>
                </div>
              </div>

              <div class="pt-4 space-y-3 text-xs">
                <div>
                  <span class="text-gray-400 font-medium block mb-1">Delivery Address</span>
                  <p class="text-gray-700 leading-relaxed font-medium">
                    {{ data()?.shippingAddress?.address1 }}
                    @if (data()?.shippingAddress?.address2) {
                      , {{ data()?.shippingAddress?.address2 }}
                    }
                    <br />
                    {{ data()?.shippingAddress?.city }}, {{ data()?.shippingAddress?.country }}
                    @if (data()?.shippingAddress?.zipCode) {
                      - {{ data()?.shippingAddress?.zipCode }}
                    }
                  </p>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-gray-100 text-gray-600">
                  <span class="text-gray-400">Address Type:</span>
                  <span class="font-medium text-gray-800">{{ data()?.shippingAddress?.addressType || 'Default' }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Info Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Information</h3>

              <div class="space-y-3 text-xs">
                <div class="flex items-center justify-between py-1">
                  <span class="text-gray-500">Method</span>
                  <span class="font-semibold text-gray-800">{{ data()?.paymentInfo?.type || 'Cash On Delivery' }}</span>
                </div>

                <div class="flex items-center justify-between py-1 border-t border-gray-100">
                  <span class="text-gray-500">Payment Status</span>
                  <span 
                    class="px-2 py-0.5 rounded font-semibold"
                    [class.bg-emerald-50]="data()?.paymentInfo?.status?.toLowerCase() === 'succeeded'"
                    [class.text-emerald-700]="data()?.paymentInfo?.status?.toLowerCase() === 'succeeded'"
                    [class.bg-amber-50]="data()?.paymentInfo?.status?.toLowerCase() !== 'succeeded'"
                    [class.text-amber-700]="data()?.paymentInfo?.status?.toLowerCase() !== 'succeeded'"
                  >
                    {{ data()?.paymentInfo?.status || 'Pending' }}
                  </span>
                </div>

                @if (data()?.paymentInfo?.paymentId) {
                  <div class="flex items-center justify-between py-1 border-t border-gray-100">
                    <span class="text-gray-500">Transaction ID</span>
                    <span class="font-mono text-gray-700 truncate max-w-[140px]" [title]="data()?.paymentInfo?.paymentId">
                      {{ data()?.paymentInfo?.paymentId }}
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>

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

  data = computed(() => {
    const targetId = String(this.orderId());
    return (this.orderStore.orders() || []).find(
        (i: any) => String(i.id ?? i._id) === targetId
    );
  });

  orderCreatedAt = computed(() => {
    const raw = this.data()?.createdAt;
    if (!raw) return 'N/A';
    return typeof raw === 'string' ? raw.slice(0, 10) : new Date(raw).toISOString().slice(0, 10);
  });

  orderStatusOptions = computed(() => {
    const all = ['Processing', 'Transferred to delivery partner', 'Shipping', 'Received', 'On the way', 'Delivered'];
    const current = this.data()?.status || 'Processing';
    const idx = all.indexOf(current);
    return all.slice(idx === -1 ? 0 : idx);
  });

  refundStatusOptions = computed(() => {
    const all = ['Processing refund', 'Refund Success'];
    const current = this.data()?.status;
    const idx = current ? all.indexOf(current) : 0;
    return all.slice(idx === -1 ? 0 : idx);
  });

  constructor() {
    effect(
        () => {
          const seller: any = this.sellerStore.seller();
          const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
          if (shopId && (!this.orderStore.orders() || this.orderStore.orders().length === 0)) {
            this.orderStore.getAllOrdersOfShop(shopId);
          }
        },
        { allowSignalWrites: true }
    );

    effect(() => {
      const currentOrder: any = this.data();
      if (currentOrder?.status && !this.status()) {
        this.status.set(currentOrder.status);
      }
    });
  }

  async ngOnInit() {
    const seller: any = this.sellerStore.seller();
    const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
    if (shopId) {
      await this.orderStore.getAllOrdersOfShop(shopId);
    }
  }

  getItemImage(item: any): string {
    if (item?.images && item.images.length > 0) {
      return item.images[0]?.url || item.images[0] || 'https://via.placeholder.com/80';
    }
    if (item?.image?.url) return item.image.url;
    return 'https://via.placeholder.com/80';
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

      const seller: any = this.sellerStore.seller();
      const shopId = seller?.id ?? seller?._id ?? seller?.shop?.id ?? seller?.shop?._id;
      if (shopId) {
        await this.orderStore.getAllOrdersOfShop(shopId);
      }

      this.router.navigate(['/dashboard-orders']);
    } catch (e: any) {
      this.toast.error(this.api.message(e));
    } finally {
      this.isUpdating.set(false);
    }
  }
}