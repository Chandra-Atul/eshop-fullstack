import { Component, EventEmitter, Input, Output, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { CartStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { CartItem } from '../../core/models';

@Component({
  selector: 'app-cart-single',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="border-b p-4">
      <div class="w-full flex items-center justify-between">
        <!-- Quantity Controls -->
        <div class="flex flex-col items-center select-none">
          <div
            class="bg-[#e44343] border border-[#e4434373] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition-transform"
            (click)="increment()"
          >
            <app-icon name="HiPlus" [size]="16" color="#fff" />
          </div>
          <span class="py-1 font-semibold text-gray-800 text-[14px]">{{ value() }}</span>
          <div
            class="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            (click)="decrement()"
          >
            <app-icon name="HiOutlineMinus" [size]="14" color="#7d879c" />
          </div>
        </div>

        <!-- Product Image -->
        <img
          [src]="itemImage"
          alt=""
          class="w-[100px] h-[80px] object-contain ml-3 mr-3 rounded-[5px]"
          (error)="handleImageError($event)"
        />

        <!-- Product Info & Total -->
        <div class="flex-1 min-w-0 pr-2">
          <h1 class="text-[14px] font-medium text-gray-900 truncate" [title]="data.name">{{ data.name }}</h1>
          <h4 class="font-[400] text-[13px] text-gray-500 pt-0.5">
            US$ {{ unitPrice }} &times; {{ value() }}
          </h4>
          <h4 class="font-[600] text-[15px] pt-1 text-[#d02222] font-Roboto">
            US$ {{ totalPrice() }}
          </h4>
        </div>

        <!-- Remove Button -->
        <button
          type="button"
          class="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
          (click)="remove.emit(data)"
        >
          <app-icon name="RxCross1" [size]="18" />
        </button>
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
// CART DRAWER COMPONENT
// ==========================================
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, IconComponent, CartSingleComponent],
  template: `
    <div class="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-50">
      <div class="fixed top-0 right-0 h-full w-[90%] sm:w-[60%] md:w-[40%] 800px:w-[28%] bg-white flex flex-col justify-between shadow-xl">
        @if (cart().length === 0) {
          <div class="w-full h-screen flex flex-col items-center justify-center relative p-6">
            <button
              type="button"
              class="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 cursor-pointer"
              (click)="closed.emit(false)"
            >
              <app-icon name="RxCross1" [size]="24" />
            </button>
            <app-icon name="IoBagHandleOutline" [size]="50" class="text-gray-300 mb-3" />
            <h5 class="text-gray-600 font-medium text-lg">Your cart is empty!</h5>
          </div>
        } @else {
          <!-- Cart Header & Items List -->
          <div class="flex-1 overflow-y-auto">
            <div class="flex items-center justify-between p-4 border-b">
              <div class="flex items-center gap-2">
                <app-icon name="IoBagHandleOutline" [size]="24" class="text-red-500" />
                <h5 class="text-[18px] font-semibold text-gray-800">{{ totalItems() }} items</h5>
              </div>
              <button
                type="button"
                class="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"
                (click)="closed.emit(false)"
              >
                <app-icon name="RxCross1" [size]="22" />
              </button>
            </div>

            <!-- Items Container -->
            <div class="w-full divide-y divide-gray-100">
              @for (item of cart(); track (item._id || item.id)) {
                <app-cart-single
                  [data]="item"
                  (quantityChange)="quantityChangeHandler($event)"
                  (remove)="removeFromCartHandler($event)"
                />
              }
            </div>
          </div>

          <!-- Checkout Footer -->
          <div class="p-4 bg-gray-50 border-t border-gray-200">
            <a
              routerLink="/checkout"
              (click)="closed.emit(false)"
              class="w-full block"
            >
              <div class="h-[48px] flex items-center justify-center w-full bg-[#e44343] hover:bg-[#d02222] rounded-[6px] transition-colors cursor-pointer shadow">
                <h1 class="text-white text-[16px] font-semibold">
                  Checkout Now (US$ {{ grandTotal() }})
                </h1>
              </div>
            </a>
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

  grandTotal = computed(() => {
    const sum = this.cart().reduce((acc, item: any) => {
      const price = Number(item.discountPrice ?? item.price ?? 0);
      const qty = Number(item.qty) || 1;
      return acc + price * qty;
    }, 0);
    return sum.toFixed(2);
  });

  removeFromCartHandler(data: CartItem) {
    this.cartStore.removeFromCart(data);
  }

  quantityChangeHandler(updatedItem: CartItem | any) {
    const id = String(updatedItem._id || updatedItem.id);
    const qty = Number(updatedItem.qty) || 1;

    // Directly update the store's cart signal and persist
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