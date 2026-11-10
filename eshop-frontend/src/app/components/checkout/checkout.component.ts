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
  template: `
    <div class="w-full flex flex-col items-center py-8">
      <div class="w-[90%] 1000px:w-[70%] block 800px:flex gap-6">
        
        <!-- Left Column: Shipping Form -->
        <div class="w-full 800px:w-[65%]">
          <div class="w-full bg-white rounded-md p-6 pb-8 shadow-sm border border-gray-100">
            <h5 class="text-[18px] font-[600] text-gray-800 border-b pb-3">Shipping Address</h5>
            <form class="mt-4">
              <div class="w-full flex pb-3 gap-3">
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Full Name</label>
                  <input
                    type="text"
                    [value]="user()?.name || ''"
                    class="{{ styles.input }} !w-full"
                    placeholder="Full Name"
                  />
                </div>
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Email Address</label>
                  <input
                    type="email"
                    [value]="user()?.email || ''"
                    class="{{ styles.input }} !w-full"
                    placeholder="Email Address"
                  />
                </div>
              </div>

              <div class="w-full flex pb-3 gap-3">
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Phone Number</label>
                  <input
                    type="tel"
                    [value]="user()?.phoneNumber || ''"
                    class="{{ styles.input }} !w-full"
                    placeholder="Phone Number"
                  />
                </div>
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Zip Code</label>
                  <input
                    type="text"
                    [ngModel]="zipCode()"
                    (ngModelChange)="zipCode.set($event)"
                    name="zipCode"
                    required
                    class="{{ styles.input }} !w-full"
                    placeholder="Pin / Zip code"
                  />
                </div>
              </div>

              <div class="w-full flex pb-3 gap-3">
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Country</label>
                  <select
                    class="w-full border h-[40px] rounded-[5px] px-2 text-gray-700 bg-white"
                    [value]="country()"
                    (change)="onCountryChange($event)"
                  >
                    <option value="">Choose your country</option>
                    @for (item of countries; track item.isoCode) {
                      <option [value]="item.isoCode">{{ item.name }}</option>
                    }
                  </select>
                </div>
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">State / City</label>
                  <select
                    class="w-full border h-[40px] rounded-[5px] px-2 text-gray-700 bg-white"
                    [value]="city()"
                    (change)="city.set($any($event.target).value)"
                  >
                    <option value="">Choose State / City</option>
                    @for (item of states(); track item.isoCode) {
                      <option [value]="item.name">{{ item.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="w-full flex pb-3 gap-3">
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Address Line 1</label>
                  <input
                    type="text"
                    required
                    [ngModel]="address1()"
                    (ngModelChange)="address1.set($event)"
                    name="address1"
                    placeholder="House/Flat No, Building, Street"
                    class="{{ styles.input }} !w-full"
                  />
                </div>
                <div class="w-[50%]">
                  <label class="block pb-2 text-sm text-gray-600">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    [ngModel]="address2()"
                    (ngModelChange)="address2.set($event)"
                    name="address2"
                    placeholder="Landmark, Area"
                    class="{{ styles.input }} !w-full"
                  />
                </div>
              </div>
            </form>

            <h5
              class="text-[15px] text-[#3321c8] font-medium cursor-pointer inline-block mt-2 hover:underline"
              (click)="userInfo.set(!userInfo())"
            >
              Choose From saved address
            </h5>

            @if (userInfo()) {
              <div class="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                @if (user()) {
                  @for (item of user()!.addresses || []; track (item._id || item.id || $index)) {
                    <div class="w-full flex items-center my-1.5 cursor-pointer" (click)="pickAddress(item)">
                      <input
                        type="radio"
                        name="savedAddr"
                        class="mr-3 cursor-pointer text-[#3321c8]"
                      />
                      <span class="text-sm font-medium text-gray-800">{{ item.addressType }}: </span>
                      <span class="text-sm text-gray-600 ml-1 truncate">{{ item.address1 }}, {{ item.city }}</span>
                    </div>
                  }
                  @if (!user()!.addresses || user()!.addresses.length === 0) {
                    <p class="text-xs text-gray-500">No saved addresses found.</p>
                  }
                }
              </div>
            }
          </div>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <div class="w-full bg-white rounded-md p-6 pb-8 shadow-sm border border-gray-100">
            <h5 class="text-[18px] font-[600] text-gray-800 border-b pb-3 mb-4">Order Summary</h5>
            
            <div class="flex justify-between items-center py-2">
              <h3 class="text-[15px] text-gray-500">Subtotal:</h3>
              <h5 class="text-[16px] font-[600] text-gray-800">₹ {{ subTotalPrice() }}</h5>
            </div>

            <div class="flex justify-between items-center py-2">
              <h3 class="text-[15px] text-gray-500">Shipping:</h3>
              <h5 class="text-[16px] font-[600] text-gray-800">₹ {{ shipping().toFixed(2) }}</h5>
            </div>

            <div class="flex justify-between items-center py-2 border-b pb-3">
              <h3 class="text-[15px] text-gray-500">Discount:</h3>
              <h5 class="text-[16px] font-[600] text-green-600">
                {{ discountPrice() ? '- ₹ ' + discountPrice() : '-' }}
              </h5>
            </div>

            <div class="flex justify-between items-center pt-3">
              <h3 class="text-[16px] font-bold text-gray-900">Total:</h3>
              <h5 class="text-[20px] font-[700] text-[#f63b60]">₹ {{ totalPrice() }}</h5>
            </div>

            <!-- Coupon Code -->
            <form (ngSubmit)="handleSubmit($event)" class="mt-6">
              <input
                type="text"
                class="{{ styles.input }} !w-full h-[40px] pl-3"
                placeholder="Coupon code"
                [ngModel]="couponCode()"
                (ngModelChange)="couponCode.set($event)"
                name="couponCode"
              />
              <button
                class="w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] hover:bg-[#f63b60] hover:text-white transition-colors rounded-[5px] mt-3 cursor-pointer font-medium"
                type="submit"
              >
                Apply code
              </button>
            </form>
          </div>
        </div>

      </div>

      <!-- Action Button -->
      <div
        class="{{ styles.button }} !bg-[#3321c8] hover:!bg-[#2617a2] w-[180px] 800px:w-[280px] !h-[48px] mt-10 rounded-xl cursor-pointer flex items-center justify-center shadow transition-all active:scale-95"
        (click)="paymentSubmit()"
      >
        <h5 class="text-white text-[16px] font-semibold">Go to Payment</h5>
      </div>
    </div>
  `,
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
  country = signal('IN'); // Defaults to India
  city = signal('Karnataka');
  userInfo = signal(false);

  address1 = signal('Hinjewadi phase 3');
  address2 = signal('');
  zipCode = signal<any>('411057');

  couponCode = signal('');
  couponCodeData = signal<any>(null);
  discountPrice = signal<number>(0);

  states = computed(() => (this.country() ? State.getStatesOfCountry(this.country()) : []));

  subTotalPrice = computed(() => {
    const cart = this.cartStore.cart() || [];
    return cart.reduce((acc, item: any) => {
      const price = Number(item.discountPrice ?? item.price ?? 0);
      const qty = Number(item.qty) || 1;
      return acc + (price * qty);
    }, 0);
  });

  shipping = computed(() => {
    const sub = this.subTotalPrice();
    return sub > 500 ? 0 : 50;
  });

  totalPrice = computed(() => {
    const total = this.subTotalPrice() + this.shipping() - this.discountPrice();
    return Math.max(0, total).toFixed(2);
  });

  ngOnInit() {
    window.scrollTo(0, 0);
    // Auto-populate from user if available
    const u: any = this.user();
    if (u?.addresses && u.addresses.length > 0) {
      const defaultAddr = u.addresses.find((a: any) => a.isDefault) || u.addresses[0];
      this.pickAddress(defaultAddr);
    }
  }

  onCountryChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.country.set(val);
    this.city.set('');
  }

  pickAddress(item: any) {
    this.address1.set(item.address1 || '');
    this.address2.set(item.address2 || '');
    this.zipCode.set(item.zipCode || '');
    this.country.set(item.country || 'IN');
    this.city.set(item.city || '');
  }

  paymentSubmit() {
    // Address2 is now optional: only validate required fields
    if (!this.address1() || !this.zipCode() || !this.country() || !this.city()) {
      this.toast.error('Please enter Address, City, Country, and Zip Code!');
      return;
    }

    const shippingAddress = {
      address1: this.address1(),
      address2: this.address2() || '',
      zipCode: this.zipCode(),
      country: this.country(),
      city: this.city(),
    };

    const orderData = {
      cart: this.cartStore.cart() || [],
      totalPrice: this.totalPrice(),
      subTotalPrice: this.subTotalPrice(),
      shipping: this.shipping(),
      discountPrice: this.discountPrice(),
      shippingAddress,
      user: this.user(),
    };

    localStorage.setItem('latestOrder', JSON.stringify(orderData));
    this.router.navigate(['/payment']);
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.couponCode().trim()) {
      this.toast.error('Enter a valid coupon code');
      return;
    }

    try {
      const res: any = await this.api.get(`${server}/coupon/get-coupon-value/${this.couponCode()}`);
      if (res?.couponCode) {
        const coupon = res.couponCode;
        const cart = this.cartStore.cart() || [];
        const eligibleItems = cart.filter((item: any) => String(item.shopId || item.shop?._id) === String(coupon.shopId));

        if (eligibleItems.length === 0) {
          this.toast.error('Coupon code is not valid for the items in your cart');
          this.couponCode.set('');
          return;
        }

        const eligiblePrice = eligibleItems.reduce((acc: number, item: any) => {
          const price = Number(item.discountPrice ?? item.price ?? 0);
          const qty = Number(item.qty) || 1;
          return acc + (price * qty);
        }, 0);

        const discount = Math.round((eligiblePrice * Number(coupon.value)) / 100);
        this.discountPrice.set(discount);
        this.couponCodeData.set(coupon);
        this.couponCode.set('');
        this.toast.success('Coupon applied successfully!');
      } else {
        this.toast.error("Coupon code doesn't exist!");
        this.couponCode.set('');
      }
    } catch (error) {
      this.toast.error(this.api.message(error));
    }
  }
}