import { Component, EventEmitter, Input, Output, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { CartItem } from '../../core/models';

// ==========================================
// 1. CART SINGLE ITEM COMPONENT
// ==========================================
@Component({
  selector: 'app-cart-single',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="p-3.5 hover:bg-gray-50/80 transition-colors border-b border-gray-100">
      <div class="flex items-center gap-3 w-full">
        
        <!-- Strictly Constrained Image Thumbnail -->
        <div class="w-[72px] h-[72px] min-w-[72px] max-w-[72px] bg-gray-50 border border-gray-100 rounded-xl p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
          <img
            [src]="itemImage"
            [alt]="data?.name"
            class="w-full h-full object-contain"
            (error)="handleImageError($event)"
          />
        </div>

        <!-- Details & Stepper -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-1.5">
            <h4 class="text-xs sm:text-sm font-semibold text-gray-900 truncate leading-tight" [title]="data?.name">
              {{ data?.name }}
            </h4>
            <button
              type="button"
              class="w-6 h-6 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition-all shrink-0 ml-1"
              title="Remove item"
              (click)="remove.emit(data)"
            >
              <app-icon name="RxCross1" [size]="13" />
            </button>
          </div>

          <p class="text-[11px] text-gray-400 mt-0.5">
            ₹{{ unitPrice.toFixed(2) }} each
          </p>

          <div class="flex items-center justify-between mt-2.5">
            <!-- Stepper Pill (- qty +) -->
            <div class="inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200/80 select-none">
              <button
                type="button"
                class="w-6 h-6 rounded-md bg-white hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-2xs disabled:opacity-40"
                [disabled]="value() <= 1"
                (click)="decrement()"
              >
                <span class="text-xs font-bold leading-none">−</span>
              </button>

              <span class="w-7 text-center font-bold text-xs text-gray-800">
                {{ value() }}
              </span>

              <button
                type="button"
                class="w-6 h-6 rounded-md bg-white hover:bg-gray-200 text-gray-800 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-2xs"
                (click)="increment()"
              >
                <span class="text-xs font-bold leading-none">+</span>
              </button>
            </div>

            <!-- Line Item Subtotal -->
            <div class="text-right">
              <span class="text-sm font-extrabold text-gray-900 font-Roboto">
                ₹ {{ totalPrice() }}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class CartSingleComponent implements OnInit {
  private toast = inject(ToastService);

  @Input() data!: CartItem | any;
  @Output() quantityChange = new EventEmitter<CartItem>();
  @Output() remove = new EventEmitter<CartItem>();

  styles = styles;
  value = signal(1);

  get unitPrice(): number {
    return Number(this.data?.discountPrice ?? this.data?.price ?? 0);
  }

  get itemImage(): string {
    const firstImg = this.data?.images?.[0];
    if (!firstImg) return 'https://placehold.co/100x80?text=No+Image';
    return typeof firstImg === 'string' ? firstImg : (firstImg?.url || 'https://placehold.co/100x80?text=No+Image');
  }

  totalPrice = computed(() => (this.unitPrice * this.value()).toFixed(2));

  ngOnInit() {
    this.value.set(Number(this.data?.qty) || 1);
  }

  increment() {
    const maxStock = Number(this.data?.stock ?? this.data?.Stock ?? 99);
    if (this.value() >= maxStock) {
      this.toast.error('Product stock limited!');
      return;
    }
    const nextVal = this.value() + 1;
    this.value.set(nextVal);
    this.quantityChange.emit({ ...this.data, qty: nextVal });
  }

  decrement() {
    if (this.value() <= 1) return;
    const nextVal = this.value() - 1;
    this.value.set(nextVal);
    this.quantityChange.emit({ ...this.data, qty: nextVal });
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://placehold.co/100x80?text=No+Image';
  }
}

// ==========================================
// 2. CART DRAWER COMPONENT
// ==========================================
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, IconComponent, CartSingleComponent],
  template: `
    <div class="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-xs z-50 transition-opacity">
      <div class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white flex flex-col justify-between shadow-2xl border-l border-gray-100">
        
        <!-- Header -->
        <div class="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <app-icon name="IoBagHandleOutline" [size]="20" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-gray-900 leading-tight">Your Cart</h3>
              <p class="text-xs text-gray-500 font-medium">
                {{ totalItems() }} {{ totalItems() === 1 ? 'item' : 'items' }} selected
              </p>
            </div>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
            (click)="closed.emit(false)"
          >
            <app-icon name="RxCross1" [size]="16" />
          </button>
        </div>

        @if (cart().length === 0) {
          <!-- Empty State -->
          <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
              <app-icon name="IoBagHandleOutline" [size]="40" />
            </div>
            <h4 class="text-lg font-bold text-gray-900">Your bag is empty</h4>
            <p class="text-xs sm:text-sm text-gray-400 mt-1 max-w-[240px] leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <button
              type="button"
              (click)="closed.emit(false)"
              class="mt-6 px-6 py-2.5 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              Start Exploring
            </button>
          </div>
        } @else {
          <!-- Free Delivery Progress Bar -->
          <div class="px-5 py-3 bg-indigo-50/60 border-b border-indigo-100/60 shrink-0">
            <div class="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1.5">
              <span>{{ freeShippingThresholdRemaining() <= 0 ? '🎉 Free Delivery Unlocked!' : 'Free Delivery Goal' }}</span>
              <span class="text-indigo-600">
                {{ freeShippingThresholdRemaining() <= 0 ? 'Eligible' : 'Add ₹' + freeShippingThresholdRemaining().toFixed(0) + ' more' }}
              </span>
            </div>
            <div class="w-full bg-white h-2 rounded-full overflow-hidden border border-indigo-100">
              <div
                class="bg-gradient-to-r from-[#4f46e5] to-emerald-500 h-full rounded-full transition-all duration-300"
                [style.width.%]="shippingProgressPercent()"
              ></div>
            </div>
          </div>

          <!-- Items Scroll Area (Strictly Locked Horizontally) -->
          <div class="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-100">
            @for (item of cart(); track (item._id || item.id)) {
              <app-cart-single
                [data]="item"
                (quantityChange)="quantityChangeHandler($event)"
                (remove)="removeFromCartHandler($event)"
              />
            }
          </div>

          <!-- Bottom Summary & Checkout -->
          <div class="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.04)] space-y-3 shrink-0">
            <div class="space-y-1.5 text-xs text-gray-500 font-medium pb-2 border-b border-gray-100">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="text-gray-900 font-semibold">₹ {{ grandTotal() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Estimated Shipping</span>
                <span class="text-emerald-600 font-semibold">
                  {{ freeShippingThresholdRemaining() <= 0 ? 'FREE' : '₹ 99.00' }}
                </span>
              </div>
            </div>

            <div class="flex items-baseline justify-between pt-1">
              <div>
                <span class="text-xs text-gray-500 block">Total Due</span>
                <span class="text-xs text-gray-400">Taxes included</span>
              </div>
              <span class="text-2xl font-black text-gray-900 font-Roboto">
                ₹ {{ grandTotal() }}
              </span>
            </div>

            <a
              routerLink="/checkout"
              (click)="closed.emit(false)"
              class="w-full h-12 rounded-xl bg-[#e44343] hover:bg-[#d02222] text-white font-bold text-sm flex items-center justify-between px-5 shadow-lg shadow-rose-900/15 active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <span class="bg-white/20 px-2.5 py-1 rounded-lg text-xs font-semibold">
                ₹ {{ grandTotal() }}
              </span>
            </a>

            <div class="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
              <span class="flex items-center gap-1">🛡 100% Safe Payments</span>
              <span>•</span>
              <span class="flex items-center gap-1">⚡ Fast Dispatch</span>
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class CartComponent {
  private cartStore = inject(CartStore);
  @Output() closed = new EventEmitter<boolean>();

  styles = styles;
  cart = computed(() => this.cartStore.cart() || []);

  totalItems = computed(() =>
      this.cart().reduce((acc, item: any) => acc + (Number(item.qty) || 1), 0)
  );

  numericTotal = computed(() => {
    return this.cart().reduce((acc, item: any) => {
      const price = Number(item.discountPrice ?? item.price ?? 0);
      const qty = Number(item.qty) || 1;
      return acc + (price * qty);
    }, 0);
  });

  grandTotal = computed(() => this.numericTotal().toFixed(2));

  freeShippingThresholdRemaining = computed(() => {
    const threshold = 999;
    return Math.max(0, threshold - this.numericTotal());
  });

  shippingProgressPercent = computed(() => {
    const threshold = 999;
    return Math.min(100, Math.round((this.numericTotal() / threshold) * 100));
  });

  removeFromCartHandler(data: CartItem) {
    this.cartStore.removeFromCart(data);
  }

  quantityChangeHandler(updatedItem: CartItem | any) {
    const id = String(updatedItem._id || updatedItem.id);
    const qty = Number(updatedItem.qty) || 1;

    const nextCart = this.cartStore.cart().map((item: any) => {
      if (String(item._id || item.id) === id) {
        return { ...item, qty };
      }
      return item;
    });

    this.cartStore.cart.set(nextCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(nextCart));
    }
  }
}