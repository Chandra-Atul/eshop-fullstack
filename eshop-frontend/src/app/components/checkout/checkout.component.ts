import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Country, State } from 'country-state-city';
import { styles } from '../../styles';
import { CartStore, UserStore } from '../../core/state';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule],
  template: `<div class="w-full flex flex-col items-center py-8">
    <div class="w-[90%] 1000px:w-[70%] block 800px:flex">
      <div class="w-full 800px:w-[65%]">
        <div class="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
          <h5 class="text-[18px] font-[500]">Shipping Address</h5><br />
          <form>
            <div class="w-full flex pb-3">
              <div class="w-[50%]"><label class="block pb-2">Full Name</label>
                <input type="text" [value]="user()?.name" required class="{{ styles.input }} !w-[95%]" /></div>
              <div class="w-[50%]"><label class="block pb-2">Email Address</label>
                <input type="email" [value]="user()?.email" required class="{{ styles.input }}" /></div>
            </div>
            <div class="w-full flex pb-3">
              <div class="w-[50%]"><label class="block pb-2">Phone Number</label>
                <input type="number" required [value]="user()?.phoneNumber" class="{{ styles.input }} !w-[95%]" /></div>
              <div class="w-[50%]"><label class="block pb-2">Zip Code</label>
                <input type="number" [ngModel]="zipCode()" (ngModelChange)="zipCode.set($event)" name="zipCode" required class="{{ styles.input }}" /></div>
            </div>
            <div class="w-full flex pb-3">
              <div class="w-[50%]"><label class="block pb-2">Country</label>
                <select class="w-[95%] border h-[40px] rounded-[5px]" [value]="country()" (change)="country.set($any($event.target).value)">
                  <option class="block pb-2" value="">Choose your country</option>
                  @for (item of countries; track item.isoCode) { <option [value]="item.isoCode">{{ item.name }}</option> }
                </select></div>
              <div class="w-[50%]"><label class="block pb-2">City</label>
                <select class="w-[95%] border h-[40px] rounded-[5px]" [value]="city()" (change)="city.set($any($event.target).value)">
                  <option class="block pb-2" value="">Choose your City</option>
                  @for (item of states(); track item.isoCode) { <option [value]="item.isoCode">{{ item.name }}</option> }
                </select></div>
            </div>
            <div class="w-full flex pb-3">
              <div class="w-[50%]"><label class="block pb-2">Address1</label>
                <input type="text" required [ngModel]="address1()" (ngModelChange)="address1.set($event)" name="address1" class="{{ styles.input }} !w-[95%]" /></div>
              <div class="w-[50%]"><label class="block pb-2">Address2</label>
                <input type="text" [ngModel]="address2()" (ngModelChange)="address2.set($event)" name="address2" required class="{{ styles.input }}" /></div>
            </div>
            <div></div>
          </form>
          <h5 class="text-[18px] cursor-pointer inline-block" (click)="userInfo.set(!userInfo())">Choose From saved address</h5>
          @if (userInfo()) {
            <div>@if (user()) {
              @for (item of user()!.addresses || []; track item._id) {
                <div class="w-full flex mt-1"><input type="checkbox" class="mr-3" [value]="item.addressType" (click)="pickAddress(item)" /><h2>{{ item.addressType }}</h2></div>
              }
            }</div>
          }
        </div>
      </div>
      <div class="w-full 800px:w-[35%] 800px:mt-0 mt-8">
        <div class="w-full bg-[#fff] rounded-md p-5 pb-8">
          <div class="flex justify-between"><h3 class="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3><h5 class="text-[18px] font-[600]">&#36;{{ subTotalPrice() }}</h5></div><br />
          <div class="flex justify-between"><h3 class="text-[16px] font-[400] text-[#000000a4]">shipping:</h3><h5 class="text-[18px] font-[600]">&#36;{{ shipping().toFixed(2) }}</h5></div><br />
          <div class="flex justify-between border-b pb-3"><h3 class="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
            <h5 class="text-[18px] font-[600]">- {{ discountPercentenge() ? '$' + discountPercentenge() : '' }}</h5></div>
          <h5 class="text-[18px] font-[600] text-end pt-3">&#36;{{ totalPrice() }}</h5><br />
          <form (ngSubmit)="handleSubmit($event)">
            <input type="text" class="{{ styles.input }} h-[40px] pl-2" placeholder="Coupoun code" [ngModel]="couponCode()" (ngModelChange)="couponCode.set($event)" name="couponCode" required />
            <input class="w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer" required value="Apply code" type="submit" />
          </form>
        </div>
      </div>
    </div>
    <div class="{{ styles.button }} w-[150px] 800px:w-[280px] mt-10" (click)="paymentSubmit()"><h5 class="text-white">Go to Payment</h5></div>
  </div>`,
})
export class CheckoutComponent implements OnInit {
  private userStore = inject(UserStore);
  private cartStore = inject(CartStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  styles = styles;
  user = this.userStore.user;
  countries = Country.getAllCountries();
  country = signal(''); city = signal(''); userInfo = signal(false);
  address1 = signal(''); address2 = signal(''); zipCode = signal<any>(null);
  couponCode = signal(''); couponCodeData = signal<any>(null); discountPrice = signal<any>(null);
  states = computed(() => (this.country() ? State.getStatesOfCountry(this.country()) : []));
  subTotalPrice = computed(() => this.cartStore.cart().reduce((acc, item) => acc + item.qty * item.discountPrice, 0));
  shipping = computed(() => this.subTotalPrice() * 0.1);
  discountPercentenge = computed(() => (this.couponCodeData() ? this.discountPrice() : ''));
  totalPrice = computed(() => this.couponCodeData()
    ? (this.subTotalPrice() + this.shipping() - this.discountPercentenge()).toFixed(2)
    : (this.subTotalPrice() + this.shipping()).toFixed(2));
  ngOnInit() { window.scrollTo(0, 0); }
  pickAddress(item: any) {
    this.address1.set(item.address1); this.address2.set(item.address2); this.zipCode.set(item.zipCode);
    this.country.set(item.country); this.city.set(item.city);
  }
  paymentSubmit() {
    if (this.address1() === '' || this.address2() === '' || this.zipCode() === null || this.country() === '' || this.city() === '') {
      this.toast.error('Please choose your delivery address!');
    } else {
      const shippingAddress = { address1: this.address1(), address2: this.address2(), zipCode: this.zipCode(), country: this.country(), city: this.city() };
      const orderData = { cart: this.cartStore.cart(), totalPrice: this.totalPrice(), subTotalPrice: this.subTotalPrice(), shipping: this.shipping(), discountPrice: this.discountPercentenge(), shippingAddress, user: this.user() };
      localStorage.setItem('latestOrder', JSON.stringify(orderData));
      this.router.navigate(['/payment']);
    }
  }
  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      const res: any = await this.api.get(`${server}/coupon/get-coupon-value/${this.couponCode()}`);
      const shopId = res.couponCode?.shopId;
      const couponCodeValue = res.couponCode?.value;
      if (res.couponCode !== null) {
        const cart = this.cartStore.cart();
        const isCouponValid = cart.filter((item: any) => item.shopId === shopId);
        if (isCouponValid.length === 0) { this.toast.error('Coupon code is not valid for this shop'); this.couponCode.set(''); }
        else {
          const eligiblePrice = isCouponValid.reduce((acc, item) => acc + item.qty * item.discountPrice, 0);
          this.discountPrice.set((eligiblePrice * couponCodeValue) / 100);
          this.couponCodeData.set(res.couponCode);
          this.couponCode.set('');
        }
      }
      if (res.couponCode === null) { this.toast.error("Coupon code doesn't exists!"); this.couponCode.set(''); }
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}
