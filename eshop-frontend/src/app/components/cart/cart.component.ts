import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
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
  template: `<div class="border-b p-4"><div class="w-full flex items-center">
    <div>
      <div class="bg-[#e44343] border border-[#e4434373] rounded-full w-[25px] h-[25px] {{ styles.noramlFlex }} justify-center cursor-pointer" (click)="increment()">
        <app-icon name="HiPlus" [size]="18" color="#fff" /></div>
      <span class="pl-[10px]">{{ data.qty }}</span>
      <div class="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer" (click)="decrement()">
        <app-icon name="HiOutlineMinus" [size]="16" color="#7d879c" /></div>
    </div>
    <img [src]="data?.images[0]?.url" alt="" class="w-[130px] h-min ml-2 mr-2 rounded-[5px]" />
    <div class="pl-[5px]">
      <h1>{{ data.name }}</h1>
      <h4 class="font-[400] text-[15px] text-[#00000082]">&#36;{{ data.discountPrice }} * {{ value() }}</h4>
      <h4 class="font-[600] text-[17px] pt-[3px] text-[#d02222] font-Roboto">US&#36;{{ totalPrice() }}</h4>
    </div>
    <app-icon name="RxCross1" class="cursor-pointer" (click)="remove.emit(data)" />
  </div></div>`,
})
export class CartSingleComponent {
  private toast = inject(ToastService);
  @Input() data!: CartItem;
  @Output() quantityChange = new EventEmitter<CartItem>();
  @Output() remove = new EventEmitter<CartItem>();
  styles = styles;
  value = signal(1);
  totalPrice = computed(() => this.data.discountPrice * this.value());
  ngOnInit() { this.value.set(this.data.qty); }
  increment() {
    if (this.data.stock < this.value()) { this.toast.error('Product stock limited!'); }
    else { this.value.set(this.value() + 1); this.quantityChange.emit({ ...this.data, qty: this.value() }); }
  }
  decrement() {
    this.value.set(this.value() === 1 ? 1 : this.value() - 1);
    this.quantityChange.emit({ ...this.data, qty: this.value() === 1 ? 1 : this.value() });
  }
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, IconComponent, CartSingleComponent],
  template: `<div class="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
    <div class="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%] bg-white flex flex-col overflow-y-scroll justify-between shadow-sm">
      @if (cart().length === 0) {
        <div class="w-full h-screen flex items-center justify-center">
          <div class="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3"><app-icon name="RxCross1" [size]="25" class="cursor-pointer" (click)="closed.emit(false)" /></div>
          <h5>Cart Items is empty!</h5>
        </div>
      } @else {
        <div>
          <div class="flex w-full justify-end pt-5 pr-5"><app-icon name="RxCross1" [size]="25" class="cursor-pointer" (click)="closed.emit(false)" /></div>
          <div class="{{ styles.noramlFlex }} p-4"><app-icon name="IoBagHandleOutline" [size]="25" /><h5 class="pl-2 text-[20px] font-[500]">{{ cart().length }} items</h5></div>
          <br />
          <div class="w-full border-t">
            @for (i of cart(); track i._id) {
              <app-cart-single [data]="i" (quantityChange)="quantityChangeHandler($event)" (remove)="removeFromCartHandler($event)" />
            }
          </div>
        </div>
        <div class="px-5 mb-3">
          <a routerLink="/checkout"><div class="h-[45px] flex items-center justify-center w-[100%] bg-[#e44343] rounded-[5px]">
            <h1 class="text-[#fff] text-[18px] font-[600]">Checkout Now (USD&#36;{{ totalPrice() }})</h1></div></a>
        </div>
      }
    </div>
  </div>`,
})
export class CartComponent {
  private cartStore = inject(CartStore);
  @Output() closed = new EventEmitter<boolean>();
  styles = styles;
  cart = computed(() => this.cartStore.cart());
  totalPrice = computed(() => this.cartStore.cart().reduce((acc, item) => acc + item.qty * item.discountPrice, 0));
  removeFromCartHandler(data: CartItem) { this.cartStore.removeFromCart(data); }
  quantityChangeHandler(data: CartItem) { this.cartStore.addTocart(data); }
}