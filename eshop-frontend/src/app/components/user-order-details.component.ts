import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../core/icon.component';
import { styles } from '../styles';
import { OrderStore, UserStore } from '../core/state';
import { ApiService } from '../core/api.service';
import { ToastService } from '../core/toast.service';
import { server } from '../config';

@Component({
  selector: 'app-user-order-details',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-[#f8fafc] py-8 px-4 800px:px-10">
      <div class="max-w-6xl mx-auto">

        <!-- Header Bar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-[#e94560] shadow-sm">
              <app-icon name="BsFillBagFill" [size]="22" />
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-900">Order #{{ orderId() }}</h1>
                <span
                  class="px-3 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider border"
                  [class.bg-blue-50]="data()?.status === 'Processing' || !data()?.status"
                  [class.text-blue-700]="data()?.status === 'Processing' || !data()?.status"
                  [class.border-blue-200]="data()?.status === 'Processing' || !data()?.status"
                  [class.bg-emerald-50]="data()?.status === 'Delivered' || data()?.status === 'Succeeded'"
                  [class.text-emerald-700]="data()?.status === 'Delivered' || data()?.status === 'Succeeded'"
                  [class.border-emerald-200]="data()?.status === 'Delivered' || data()?.status === 'Succeeded'"
                  [class.bg-amber-50]="data()?.status === 'Shipping' || data()?.status === 'On the way'"
                  [class.text-amber-700]="data()?.status === 'Shipping' || data()?.status === 'On the way'"
                  [class.border-amber-200]="data()?.status === 'Shipping' || data()?.status === 'On the way'"
                  [class.bg-rose-50]="data()?.status === 'Processing refund' || data()?.status === 'Refund Success'"
                  [class.text-rose-700]="data()?.status === 'Processing refund' || data()?.status === 'Refund Success'"
                  [class.border-rose-200]="data()?.status === 'Processing refund' || data()?.status === 'Refund Success'"
                >
                  {{ data()?.status || 'Processing' }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Placed on {{ orderCreatedAt() }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <a routerLink="/profile">
              <button class="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer">
                <app-icon name="AiOutlineArrowRight" class="rotate-180" [size]="14" />
                Back to My Orders
              </button>
            </a>
          </div>
        </div>

        <!-- Main 2-Column Content Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left 2 Cols: Order Items & Actions -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Items Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="text-base font-semibold text-gray-900">Ordered Products</h2>
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
                        <div class="text-xs text-gray-600 mt-1 font-medium">
                          ₹{{ item?.discountPrice ?? item?.price ?? 0 }} × {{ item?.qty || 1 }}
                        </div>
                      </div>

                      <div class="text-right shrink-0 flex flex-col items-end gap-2">
                        <div class="text-base font-bold text-gray-900">
                          ₹{{ (((item?.discountPrice ?? item?.price ?? 0) * (item?.qty || 1))).toFixed(2) }}
                        </div>

                        @if (!item.isReviewed && data()?.status === 'Delivered') {
                          <button
                            (click)="openReview(item)"
                            class="px-3 py-1 bg-[#fce1e6] hover:bg-[#fad2da] text-[#e94560] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                          >
                            Write a Review
                          </button>
                        }
                      </div>
                    </div>
                  }
                } @else {
                  <div class="py-12 text-center text-gray-400 text-sm">
                    No items found for this order.
                  </div>
                }
              </div>

              <!-- Price Breakdown -->
              <div class="bg-gray-50/70 p-6 border-t border-gray-100 space-y-2">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span class="font-medium text-gray-900">₹{{ data()?.totalPrice ?? 0 }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span class="text-emerald-600 font-medium">Free</span>
                </div>
                <div class="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span class="text-base font-bold text-gray-900">Total Amount Paid</span>
                  <span class="text-xl font-extrabold text-[#e94560]">₹{{ data()?.totalPrice ?? 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Refund Request Card (Only visible if Delivered) -->
            @if (data()?.status === 'Delivered') {
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-semibold text-gray-900">Need a Return or Refund?</h3>
                  <p class="text-xs text-gray-500 mt-0.5">Submit a refund request if the product arrived damaged or incorrect.</p>
                </div>
                <button
                  (click)="refundHandler()"
                  class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                >
                  Request Refund
                </button>
              </div>
            }

          </div>

          <!-- Right 1 Col: Shipping & Payment Summary -->
          <div class="space-y-6">

            <!-- Shipping Address Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery Address</h3>

              <div class="space-y-3 text-xs leading-relaxed text-gray-700 font-medium">
                <p>
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

                <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-gray-600">
                  <span class="text-gray-400">Address Type:</span>
                  <span class="font-semibold text-gray-800">{{ data()?.shippingAddress?.addressType || 'Default' }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Summary Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Summary</h3>

              <div class="space-y-3 text-xs">
                <div class="flex items-center justify-between py-1">
                  <span class="text-gray-500">Method</span>
                  <span class="font-semibold text-gray-800">{{ data()?.paymentInfo?.type || 'Cash On Delivery' }}</span>
                </div>

                <div class="flex items-center justify-between py-1 border-t border-gray-100">
                  <span class="text-gray-500">Status</span>
                  <span
                    class="px-2 py-0.5 rounded font-semibold text-xs"
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

    <!-- Review Modal Dialog -->
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Write a Review</h2>
            <button (click)="open.set(false)" class="text-gray-400 hover:text-gray-600 cursor-pointer">
              <app-icon name="RxCross1" [size]="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <!-- Product Preview in Modal -->
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img
                [src]="getItemImage(selectedItem())"
                alt=""
                class="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
              />
              <div class="min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 truncate">{{ selectedItem()?.name }}</h4>
                <p class="text-xs text-gray-500 mt-0.5">₹{{ selectedItem()?.discountPrice ?? selectedItem()?.price }} × {{ selectedItem()?.qty || 1 }}</p>
              </div>
            </div>

            <!-- Rating Stars -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Rating <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-1.5">
                @for (i of [1, 2, 3, 4, 5]; track i) {
                  @if (rating() >= i) {
                    <app-icon
                      name="AiFillStar"
                      [size]="28"
                      color="rgb(246,186,0)"
                      class="cursor-pointer transition-transform hover:scale-110"
                      (click)="rating.set(i)"
                    />
                  } @else {
                    <app-icon
                      name="AiOutlineStar"
                      [size]="28"
                      color="rgb(209,213,219)"
                      class="cursor-pointer transition-transform hover:scale-110"
                      (click)="rating.set(i)"
                    />
                  }
                }
              </div>
            </div>

            <!-- Comment Input -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Your Feedback <span class="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows="4"
                [ngModel]="comment()"
                (ngModelChange)="comment.set($event)"
                placeholder="How was the product quality, fit, and delivery?"
                class="w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560]"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="open.set(false)"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="reviewHandler()"
                class="px-6 py-2 bg-[#e94560] hover:bg-[#d63853] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserOrderDetailsComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private userStore = inject(UserStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);

  styles = styles;
  open = signal(false);
  comment = signal('');
  selectedItem = signal<any>(null);
  rating = signal(5);

  orderId = computed(() => this.route.snapshot.paramMap.get('id') || '');

  // Matched against both id and _id (string-safe)
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

  constructor() {
    // Proactively fetch orders when user loads or if orders are currently empty
    effect(
        () => {
          const user: any = this.userStore.user();
          const userId = user?.id ?? user?._id;
          if (userId && (!this.orderStore.orders() || this.orderStore.orders().length === 0)) {
            this.orderStore.getAllOrdersOfUser(userId);
          }
        },
        { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    const user: any = this.userStore.user();
    const userId = user?.id ?? user?._id;
    if (userId) {
      this.orderStore.getAllOrdersOfUser(userId);
    }
  }

  getItemImage(item: any): string {
    if (item?.images && item.images.length > 0) {
      return item.images[0]?.url || item.images[0] || 'https://via.placeholder.com/80';
    }
    if (item?.image?.url) return item.image.url;
    return 'https://via.placeholder.com/80';
  }

  openReview(item: any) {
    this.open.set(true);
    this.selectedItem.set(item);
  }

  async reviewHandler() {
    const user: any = this.userStore.user();
    const item = this.selectedItem();
    const productId = item?.productId ?? item?._id ?? item?.id;

    if (!this.rating()) {
      this.toast.error('Please select a star rating');
      return;
    }

    try {
      const res: any = await this.api.put(
          `${server}/product/create-new-review`,
          {
            user,
            rating: this.rating(),
            comment: this.comment(),
            productId,
            orderId: this.orderId(),
          },
          true
      );
      this.toast.success(res?.message || 'Review submitted successfully!');

      const userId = user?.id ?? user?._id;
      if (userId) this.orderStore.getAllOrdersOfUser(userId);

      this.comment.set('');
      this.rating.set(5);
      this.open.set(false);
    } catch (error) {
      this.toast.error(this.api.message(error));
    }
  }

  async refundHandler() {
    const user: any = this.userStore.user();
    try {
      const res: any = await this.api.put(
          `${server}/order/order-refund/${this.orderId()}`,
          { status: 'Processing refund' },
          true
      );
      this.toast.success(res?.message || 'Refund request submitted!');

      const userId = user?.id ?? user?._id;
      if (userId) this.orderStore.getAllOrdersOfUser(userId);
    } catch (error) {
      this.toast.error(this.api.message(error));
    }
  }
}