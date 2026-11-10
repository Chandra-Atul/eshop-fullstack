import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { UserStore, CartStore } from '../../core/state';
import { PaymentService } from '../../core/payment.service';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';

const PAYPAL_CLIENT_ID = 'Aczac4Ry9_QA1t4c7TKH9UusH3RTe6onyICPoCToHG10kjlNdI-qwobbW9JAHzaRQwFMn2-k660853jn';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="w-full flex flex-col items-center py-8">
      <div class="w-[90%] 1000px:w-[70%] block 800px:flex gap-6">
        
        <!-- Left Section: Payment Method Options -->
        <div class="w-full 800px:w-[65%]">
          <div class="w-full bg-[#fff] rounded-md p-6 pb-8 shadow-sm border border-gray-100">
            
            <!-- 1. Stripe Debit/Credit Card -->
            <div>
              <div 
                class="flex w-full pb-5 border-b mb-3 items-center cursor-pointer select-none"
                (click)="setPaymentMethod(1)"
              >
                <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center">
                  @if (select() === 1) { 
                    <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> 
                  }
                </div>
                <h4 class="text-[18px] pl-3 font-[600] text-gray-800">Pay with Debit/Credit Card</h4>
              </div>

              <!-- Preserved in DOM with class.hidden so mounted Stripe inputs don't destroy -->
              <div class="w-full border-b pb-6" [class.hidden]="select() !== 1">
                <form class="w-full" (ngSubmit)="paymentHandler($event)">
                  <div class="mb-4">
                    <label class="block pb-2 text-sm font-medium text-gray-700">Name On Card</label>
                    <input
                      required
                      [placeholder]="userName"
                      [value]="userName"
                      class="{{ styles.input }} !w-full text-[#444]"
                    />
                  </div>

                  <!-- Unified Stripe Card Container -->
                  <div class="mb-5">
                    <label class="block pb-2 text-sm font-medium text-gray-700">Card Details</label>
                    <div 
                      #cardElementContainer 
                      class="w-full p-3.5 border border-gray-300 rounded-[5px] bg-white shadow-inner min-h-[44px]"
                    ></div>
                    @if (cardError()) {
                      <p class="text-xs text-red-500 font-medium mt-2">{{ cardError() }}</p>
                    }
                  </div>

                  <button
                    type="submit"
                    [disabled]="isProcessing()"
                    class="{{ styles.button }} !bg-[#f63b60] hover:!bg-[#e02d51] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[17px] font-[600] disabled:opacity-50 px-8 transition-colors flex items-center justify-center"
                  >
                    {{ isProcessing() ? 'Processing...' : 'Pay Now' }}
                  </button>
                </form>
              </div>
            </div>
            <br />

            <!-- 2. PayPal -->
            <div>
              <div 
                class="flex w-full pb-5 border-b mb-3 items-center cursor-pointer select-none"
                (click)="setPaymentMethod(2)"
              >
                <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center">
                  @if (select() === 2) { 
                    <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> 
                  }
                </div>
                <h4 class="text-[18px] pl-3 font-[600] text-gray-800">Pay with PayPal</h4>
              </div>

              @if (select() === 2) {
                <div class="w-full flex border-b pb-6">
                  <div
                    class="{{ styles.button }} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[17px] font-[600] px-8"
                    (click)="openPaypal()"
                  >
                    Pay Now
                  </div>
                  @if (open()) {
                    <div class="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
                      <div class="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                        <div class="w-full flex justify-end p-3">
                          <app-icon name="RxCross1" [size]="30" class="cursor-pointer absolute top-3 right-3" (click)="open.set(false)" />
                        </div>
                        <div id="paypal-button-container"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <br />

            <!-- 3. Cash on Delivery -->
            <div>
              <div 
                class="flex w-full pb-5 border-b mb-3 items-center cursor-pointer select-none"
                (click)="setPaymentMethod(3)"
              >
                <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center">
                  @if (select() === 3) { 
                    <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> 
                  }
                </div>
                <h4 class="text-[18px] pl-3 font-[600] text-gray-800">Cash on Delivery</h4>
              </div>

              @if (select() === 3) {
                <div class="w-full flex pb-6">
                  <form class="w-full" (ngSubmit)="cashOnDeliveryHandler($event)">
                    <button
                      type="submit"
                      [disabled]="isProcessing()"
                      class="{{ styles.button }} !bg-[#f63b60] hover:!bg-[#e02d51] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[17px] font-[600] px-8 disabled:opacity-50 transition-colors"
                    >
                      Confirm Order
                    </button>
                  </form>
                </div>
              }
            </div>

          </div>
        </div>

        <!-- Right Section: Order Breakdown & Coupon -->
        <div class="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <div class="w-full bg-[#fff] rounded-md p-6 pb-8 shadow-sm border border-gray-100">
            <div class="flex justify-between items-center py-1">
              <h3 class="text-[15px] font-[400] text-gray-500">Subtotal:</h3>
              <h5 class="text-[17px] font-[600] text-gray-900">₹ {{ subTotal }}</h5>
            </div>
            <br />
            <div class="flex justify-between items-center py-1">
              <h3 class="text-[15px] font-[400] text-gray-500">Shipping:</h3>
              <h5 class="text-[17px] font-[600] text-gray-900">₹ {{ shipping }}</h5>
            </div>
            <br />
            <div class="flex justify-between items-center border-b pb-3 py-1">
              <h3 class="text-[15px] font-[400] text-gray-500">Discount:</h3>
              <h5 class="text-[17px] font-[600] text-green-600">
                {{ discountDisplay() }}
              </h5>
            </div>
            <h5 class="text-[22px] font-[700] text-end pt-3 text-[#f63b60]">
              ₹ {{ finalPayable() }}
            </h5>
            <br />

            <!-- Coupon Code Section (Issue 1 Resolved) -->
            <form (ngSubmit)="applyCoupon($event)" class="mt-2">
              <input
                type="text"
                class="{{ styles.input }} !w-full h-[40px] pl-3"
                placeholder="Enter Coupon code"
                [ngModel]="couponCode()"
                (ngModelChange)="couponCode.set($event)"
                name="couponCode"
              />
              <button
                type="submit"
                class="w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] hover:bg-[#f63b60] hover:text-white transition-colors rounded-[5px] mt-3 cursor-pointer font-medium text-sm"
              >
                Apply Coupon
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class PaymentComponent implements OnInit, OnDestroy {
  private userStore = inject(UserStore);
  private cartStore = inject(CartStore);
  private paymentService = inject(PaymentService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @ViewChild('cardElementContainer') cardElementContainer?: ElementRef<HTMLDivElement>;

  styles = styles;
  user = this.userStore.user;
  orderData = signal<any>(null);
  open = signal(false);
  select = signal(1);
  isProcessing = signal(false);
  cardError = signal<string | null>(null);

  // Coupon state
  couponCode = signal('');
  appliedDiscount = signal<number>(0);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private cardMounted = false;

  get userName(): string {
    const u: any = this.user();
    return u?.name || 'Customer';
  }

  get subTotal(): number {
    return Number(this.orderData()?.subTotalPrice ?? 0);
  }

  get shipping(): string {
    return Number(this.orderData()?.shipping || 0).toFixed(2);
  }

  discountDisplay = computed(() => {
    const val = this.appliedDiscount() || Number(this.orderData()?.discountPrice || 0);
    return val > 0 ? `₹ ${val}` : '-';
  });

  finalPayable = computed(() => {
    const sub = this.subTotal;
    const ship = Number(this.shipping);
    const disc = this.appliedDiscount() || Number(this.orderData()?.discountPrice || 0);
    return Math.max(0, sub + ship - disc).toFixed(2);
  });

  ngOnInit() {
    try {
      const stored = localStorage.getItem('latestOrder');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.orderData.set(parsed);
        if (parsed?.discountPrice) {
          this.appliedDiscount.set(Number(parsed.discountPrice));
        }
      } else {
        const cart = this.cartStore.cart() || [];
        const subTotal = cart.reduce(
            (acc: number, item: any) => acc + Number(item.discountPrice ?? item.price ?? 0) * (Number(item.qty) || 1),
            0
        );
        this.orderData.set({
          cart,
          subTotalPrice: subTotal,
          shipping: subTotal > 500 ? 0 : 50,
          discountPrice: 0,
          totalPrice: subTotal + (subTotal > 500 ? 0 : 50),
          shippingAddress: { address1: 'Main Road', city: 'City', zipCode: '411057', country: 'IN' },
        });
      }
    } catch {
      this.orderData.set(null);
    }

    // Mount Stripe Card
    this.initStripe();
  }

  ngOnDestroy() {
    if (this.cardElement) {
      try {
        this.cardElement.destroy();
      } catch {}
    }
    this.elements = null;
    this.stripe = null;
    this.cardMounted = false;
  }

  setPaymentMethod(val: number) {
    this.select.set(val);
    if (val === 1 && !this.cardMounted) {
      setTimeout(() => this.mountCardElement(), 100);
    }
  }

  private async initStripe() {
    let key = this.paymentService.stripeApiKey();
    if (!key) {
      key = await this.paymentService.getStripeApiKey();
    }

    if (!key) {
      this.toast.error('Could not load Stripe publishable key');
      return;
    }

    this.stripe = await loadStripe(key);
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.mountCardElement();
    }
  }

  private mountCardElement() {
    if (this.cardMounted || !this.elements) return;

    if (!this.cardElement) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: 'system-ui, sans-serif',
            '::placeholder': { color: '#aab7c4' },
          },
          invalid: { color: '#fa755a' },
        },
      });
    }

    const checkAndMount = () => {
      if (this.cardElementContainer?.nativeElement) {
        this.cardElement!.mount(this.cardElementContainer.nativeElement);
        this.cardMounted = true;
      } else {
        setTimeout(checkAndMount, 50);
      }
    };

    checkAndMount();
  }

  async applyCoupon(e: Event) {
    e.preventDefault();
    const code = this.couponCode().trim();
    if (!code) {
      this.toast.error('Please enter a coupon code');
      return;
    }

    try {
      const res: any = await this.api.get(`${server}/coupon/get-coupon-value/${code}`);
      if (res?.couponCode) {
        const coupon = res.couponCode;
        const cart = this.orderData()?.cart || this.cartStore.cart() || [];
        const eligibleItems = cart.filter(
            (item: any) => String(item.shopId || item.shop?._id || item.shop?.id) === String(coupon.shopId)
        );

        if (eligibleItems.length === 0) {
          this.toast.error('Coupon is not applicable to items from this seller');
          return;
        }

        const eligibleTotal = eligibleItems.reduce(
            (acc: number, item: any) => acc + Number(item.discountPrice ?? item.price ?? 0) * (Number(item.qty) || 1),
            0
        );

        const discount = Math.round((eligibleTotal * Number(coupon.value)) / 100);
        this.appliedDiscount.set(discount);

        const updated = {
          ...this.orderData(),
          discountPrice: discount,
          totalPrice: this.finalPayable(),
        };
        this.orderData.set(updated);
        localStorage.setItem('latestOrder', JSON.stringify(updated));

        this.couponCode.set('');
        this.toast.success('Coupon applied successfully!');
      } else {
        this.toast.error("Coupon code doesn't exist!");
      }
    } catch (err) {
      this.toast.error(this.api.message(err));
    }
  }

  private order() {
    const o = this.orderData();
    const u: any = this.user();
    return {
      cart: o?.cart,
      shippingAddress: o?.shippingAddress,
      user: u,
      totalPrice: this.finalPayable(),
      paymentInfo: undefined as any,
    };
  }

  openPaypal() {
    this.open.set(true);
    setTimeout(() => this.renderPaypal(), 100);
  }

  private loadPaypalSdk(): Promise<void> {
    if ((window as any).paypal) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  private async renderPaypal() {
    await this.loadPaypalSdk();
    const paypal = (window as any).paypal;
    const container = document.querySelector('#paypal-button-container');
    if (!paypal || !container) return;
    container.innerHTML = '';
    paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: (_data: any, actions: any) =>
          actions.order.create({
            purchase_units: [
              {
                description: 'E-Shop Purchase',
                amount: { currency_code: 'USD', value: (Number(this.finalPayable()) || 1).toString() },
              },
            ],
            application_context: { shipping_preference: 'NO_SHIPPING' },
          }),
      onApprove: async (_data: any, actions: any) => {
        const details = await actions.order.capture();
        if (details.payer !== undefined) await this.paypalPaymentHandler(details.payer);
      },
    }).render('#paypal-button-container');
  }

  private async paypalPaymentHandler(paymentInfo: any) {
    try {
      const order: any = this.order();
      order.paymentInfo = { id: paymentInfo.payer_id, status: 'succeeded', type: 'PayPal' };
      await this.api.post(`${server}/order/create-order`, order, true);
      this.finishSuccess();
    } catch (err) {
      this.toast.error(this.api.message(err));
    }
  }

  async paymentHandler(e: Event) {
    e.preventDefault();
    this.isProcessing.set(true);
    this.cardError.set(null);

    try {
      const total = Number(this.finalPayable());
      // Stripe India expects amount in paise (₹1 = 100 paise). Math.max ensures threshold is met.
      const amountInPaise = Math.max(5000, Math.round(total * 100));

      const data: any = await this.api.post(`${server}/payment/process`, { amount: amountInPaise }, true);

      if (!this.stripe || !this.cardElement) {
        this.toast.error('Card field not initialized');
        this.isProcessing.set(false);
        return;
      }

      const u: any = this.user();
      const result = await this.stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: u?.name || 'Customer',
            email: u?.email || '',
            address: {
              line1: this.orderData()?.shippingAddress?.address1 || 'Main Street',
              city: this.orderData()?.shippingAddress?.city || 'City',
              postal_code: String(this.orderData()?.shippingAddress?.zipCode || '411057'),
              country: 'IN',
            },
          },
        },
      });

      if (result.error) {
        this.cardError.set(result.error.message || 'Payment declined');
        this.toast.error(result.error.message || 'Payment declined');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        const order: any = this.order();
        order.paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
          type: 'Credit Card',
        };
        await this.api.post(`${server}/order/create-order`, order, true);
        this.finishSuccess();
      }
    } catch (error) {
      this.toast.error(this.api.message(error));
    } finally {
      this.isProcessing.set(false);
    }
  }

  async cashOnDeliveryHandler(e: Event) {
    e.preventDefault();
    this.isProcessing.set(true);

    try {
      const order: any = this.order();
      order.paymentInfo = { type: 'Cash On Delivery', status: 'Pending' };
      await this.api.post(`${server}/order/create-order`, order, true);
      this.finishSuccess();
    } catch (error) {
      this.toast.error(this.api.message(error));
    } finally {
      this.isProcessing.set(false);
    }
  }

  private finishSuccess() {
    this.open.set(false);
    this.cartStore.clearCart();
    localStorage.removeItem('latestOrder');
    this.toast.success('Order placed successfully!');
    this.router.navigate(['/order/success']);
  }
}