import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { UserStore } from '../../core/state';
import { PaymentService } from '../../core/payment.service';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server, backend_url } from '../../config';

declare var Stripe: any;
const PAYPAL_CLIENT_ID = 'Aczac4Ry9_QA1t4c7TKH9UusH3RTe6onyICPoCToHG10kjlNdI-qwobbW9JAHzaRQwFMn2-k660853jn';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-full flex flex-col items-center py-8">
    <div class="w-[90%] 1000px:w-[70%] block 800px:flex">
      <div class="w-full 800px:w-[65%]">
        <div class="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
          <div>
            <div class="flex w-full pb-5 border-b mb-2">
              <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center" (click)="select.set(1)">
                @if (select() === 1) { <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> }
              </div>
              <h4 class="text-[18px] pl-2 font-[600] text-[#000000b1]">Pay with Debit/credit card</h4>
            </div>
            @if (select() === 1) {
              <div class="w-full flex border-b"><form class="w-full" (ngSubmit)="paymentHandler($event)">
                <div class="w-full flex pb-3">
                  <div class="w-[50%]"><label class="block pb-2">Name On Card</label>
                    <input required [placeholder]="user()?.name || ''" [value]="user()?.name || ''" class="{{ styles.input }} !w-[95%] text-[#444]" /></div>
                  <div class="w-[50%]"><label class="block pb-2">Exp Date</label><div #cardExpiry class="{{ styles.input }}"></div></div>
                </div>
                <div class="w-full flex pb-3">
                  <div class="w-[50%]"><label class="block pb-2">Card Number</label><div #cardNumber class="{{ styles.input }} !h-[35px] !w-[95%]"></div></div>
                  <div class="w-[50%]"><label class="block pb-2">CVV</label><div #cardCvc class="{{ styles.input }} !h-[35px]"></div></div>
                </div>
                <input type="submit" value="Submit" class="{{ styles.button }} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]" />
              </form></div>
            }
          </div>
          <br />
          <div>
            <div class="flex w-full pb-5 border-b mb-2">
              <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center" (click)="select.set(2)">
                @if (select() === 2) { <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> }
              </div>
              <h4 class="text-[18px] pl-2 font-[600] text-[#000000b1]">Pay with Paypal</h4>
            </div>
            @if (select() === 2) {
              <div class="w-full flex border-b">
                <div class="{{ styles.button }} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]" (click)="openPaypal()">Pay Now</div>
                @if (open()) {
                  <div class="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
                    <div class="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                      <div class="w-full flex justify-end p-3"><app-icon name="RxCross1" [size]="30" class="cursor-pointer absolute top-3 right-3" (click)="open.set(false)" /></div>
                      <div id="paypal-button-container"></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
          <br />
          <div>
            <div class="flex w-full pb-5 border-b mb-2">
              <div class="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center" (click)="select.set(3)">
                @if (select() === 3) { <div class="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full"></div> }
              </div>
              <h4 class="text-[18px] pl-2 font-[600] text-[#000000b1]">Cash on Delivery</h4>
            </div>
            @if (select() === 3) {
              <div class="w-full flex"><form class="w-full" (ngSubmit)="cashOnDeliveryHandler($event)">
                <input type="submit" value="Confirm" class="{{ styles.button }} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]" />
              </form></div>
            }
          </div>
        </div>
      </div>
      <div class="w-full 800px:w-[35%] 800px:mt-0 mt-8">
        <div class="w-full bg-[#fff] rounded-md p-5 pb-8">
          <div class="flex justify-between"><h3 class="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3><h5 class="text-[18px] font-[600]">&#36;{{ orderData()?.subTotalPrice }}</h5></div><br />
          <div class="flex justify-between"><h3 class="text-[16px] font-[400] text-[#000000a4]">shipping:</h3><h5 class="text-[18px] font-[600]">&#36;{{ shipping }}</h5></div><br />
          <div class="flex justify-between border-b pb-3"><h3 class="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
            <h5 class="text-[18px] font-[600]">{{ orderData()?.discountPrice ? '$' + orderData()?.discountPrice : '-' }}</h5></div>
          <h5 class="text-[18px] font-[600] text-end pt-3">&#36;{{ orderData()?.totalPrice }}</h5><br />
        </div>
      </div>
    </div>
  </div>`,
})
export class PaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  private userStore = inject(UserStore);
  private paymentService = inject(PaymentService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  @ViewChild('cardNumber') cardNumberRef?: ElementRef<HTMLDivElement>;
  @ViewChild('cardExpiry') cardExpiryRef?: ElementRef<HTMLDivElement>;
  @ViewChild('cardCvc') cardCvcRef?: ElementRef<HTMLDivElement>;
  styles = styles;
  user = this.userStore.user;
  orderData = signal<any>(null);
  open = signal(false);
  select = signal(1);
  private stripe: any;
  private elements: any;
  get shipping() { return this.orderData()?.shipping?.toFixed(2); }
  ngOnInit() { try { this.orderData.set(JSON.parse(localStorage.getItem('latestOrder') || 'null')); } catch { this.orderData.set(null); } }
  ngAfterViewInit() { setTimeout(() => this.mountStripe(), 300); }
  ngOnDestroy() { this.elements = null; this.stripe = null; }
  private stripeElementOptions() {
    return { style: { base: { fontSize: '19px', lineHeight: 1.5, color: '#444' }, empty: { color: '#3a120a', backgroundColor: 'transparent', '::placeholder': { color: '#444' } } } };
  }
  private async mountStripe() {
    const key = this.paymentService.stripeApiKey();
    if (!key || typeof Stripe === 'undefined') return;
    this.stripe = Stripe(key);
    this.elements = this.stripe.elements();
    if (this.cardNumberRef) this.elements.create('cardNumber', this.stripeElementOptions()).mount(this.cardNumberRef.nativeElement);
    if (this.cardExpiryRef) this.elements.create('cardExpiry', this.stripeElementOptions()).mount(this.cardExpiryRef.nativeElement);
    if (this.cardCvcRef) this.elements.create('cardCvc', this.stripeElementOptions()).mount(this.cardCvcRef.nativeElement);
  }
  private order() {
    const o = this.orderData();
    return { cart: o?.cart, shippingAddress: o?.shippingAddress, user: this.user(), totalPrice: o?.totalPrice, paymentInfo: undefined as any };
  }
  openPaypal() { this.open.set(true); setTimeout(() => this.renderPaypal(), 100); }
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
      createOrder: (data: any, actions: any) => actions.order.create({
        purchase_units: [{ description: 'Sunflower', amount: { currency_code: 'USD', value: this.orderData()?.totalPrice } }],
        application_context: { shipping_preference: 'NO_SHIPPING' },
      }).then((orderID: string) => orderID),
      onApprove: async (data: any, actions: any) => {
        const details = await actions.order.capture();
        if (details.payer !== undefined) await this.paypalPaymentHandler(details.payer);
      },
    }).render('#paypal-button-container');
  }
  private async paypalPaymentHandler(paymentInfo: any) {
    const order: any = this.order();
    order.paymentInfo = { id: paymentInfo.payer_id, status: 'succeeded', type: 'Paypal' };
    await this.api.post(`${server}/order/create-order`, order);
    this.open.set(false);
    this.router.navigate(['/order/success']);
    this.toast.success('Order successful!');
    localStorage.setItem('cartItems', JSON.stringify([])); localStorage.setItem('latestOrder', JSON.stringify([]));
    window.location.reload();
  }
  async paymentHandler(e: Event) {
    e.preventDefault();
    try {
      const data: any = await this.api.post(`${server}/payment/process`, { amount: Math.round(this.orderData()?.totalPrice * 100) });
      if (!this.stripe || !this.elements) return;
      const result = await this.stripe.confirmCardPayment(data.client_secret, { payment_method: { card: this.elements.getElement('cardNumber') } });
      if (result.error) { this.toast.error(result.error.message); }
      else if (result.paymentIntent.status === 'succeeded') {
        const order: any = this.order();
        order.paynmentInfo = { id: result.paymentIntent.id, status: result.paymentIntent.status, type: 'Credit Card' };
        await this.api.post(`${server}/order/create-order`, order);
        this.open.set(false);
        this.router.navigate(['/order/success']);
        this.toast.success('Order successful!');
        localStorage.setItem('cartItems', JSON.stringify([])); localStorage.setItem('latestOrder', JSON.stringify([]));
        window.location.reload();
      }
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
  async cashOnDeliveryHandler(e: Event) {
    e.preventDefault();
    const order: any = this.order();
    order.paymentInfo = { type: 'Cash On Delivery' };
    await this.api.post(`${server}/order/create-order`, order);
    this.open.set(false);
    this.router.navigate(['/order/success']);
    this.toast.success('Order successful!');
    localStorage.setItem('cartItems', JSON.stringify([])); localStorage.setItem('latestOrder', JSON.stringify([]));
    window.location.reload();
  }
}
