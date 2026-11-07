import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  template: `<div class="py-4 min-h-screen {{ styles.section }}">
    <div class="w-full flex items-center justify-between">
      <div class="flex items-center"><app-icon name="BsFillBagFill" [size]="30" color="crimson" /><h1 class="pl-2 text-[25px]">Order Details</h1></div>
      <a routerLink="/dashboard-orders"><div class="{{ styles.button }} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[45px] text-[18px]">Order List</div></a>
    </div>
    <div class="w-full flex items-center justify-between pt-6">
      <h5 class="text-[#00000084]">Order ID: <span>#{{ data()?._id?.slice(0, 8) }}</span></h5>
      <h5 class="text-[#00000084]">Placed on: <span>{{ data()?.createdAt?.slice(0, 10) }}</span></h5></div>
    <br /><br />
    @if (data()) {
      @for (item of data()!.cart; track item._id) {
        <div class="w-full flex items-start mb-5"><img [src]="item.images[0]?.url" alt="" class="w-[80px] h-[80px]" />
          <div class="w-full"><h5 class="pl-3 text-[20px]">{{ item.name }}</h5>
            <h5 class="pl-3 text-[20px] text-[#00000091]">US&#36;{{ item.discountPrice }} x {{ item.qty }}</h5></div></div>
      }
    }
    <div class="border-t w-full text-right"><h5 class="pt-3 text-[18px]">Total Price: <strong>US&#36;{{ data()?.totalPrice }}</strong></h5></div><br /><br />
    <div class="w-full 800px:flex items-center">
      <div class="w-full 800px:w-[60%]">
        <h4 class="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
        <h4 class="pt-3 text-[20px]">{{ data()?.shippingAddress?.address1 }} {{ data()?.shippingAddress?.address2 }}</h4>
        <h4 class="text-[20px]">{{ data()?.shippingAddress?.country }}</h4>
        <h4 class="text-[20px]">{{ data()?.shippingAddress?.city }}</h4>
        <h4 class="text-[20px]">{{ data()?.user?.phoneNumber }}</h4></div>
      <div class="w-full 800px:w-[40%]"><h4 class="pt-3 text-[20px]">Payment Info:</h4>
        <h4>Status: {{ data()?.paymentInfo?.status ? data()?.paymentInfo?.status : 'Not Paid' }}</h4></div>
    </div><br /><br />
    <h4 class="pt-3 text-[20px] font-[600]">Order Status:</h4>
    @if (data()?.status !== 'Processing refund' && data()?.status !== 'Refund Success') {
      <select [value]="status()" (change)="status.set($any($event.target).value)" class="w-[200px] mt-2 border h-[35px] rounded-[5px]">
        @for (option of orderStatusOptions(); track option) { <option [value]="option">{{ option }}</option> }
      </select>
    }
    @if (data()?.status === 'Processing refund' || data()?.status === 'Refund Success') {
      <select [value]="status()" (change)="status.set($any($event.target).value)" class="w-[200px] mt-2 border h-[35px] rounded-[5px]">
        @for (option of refundStatusOptions(); track option) { <option [value]="option">{{ option }}</option> }
      </select>
    }
    <div class="{{ styles.button }} mt-5 !bg-[#FCE1E6] !rounded-[4px] text-[#E94560] font-[600] !h-[45px] text-[18px]"
      (click)="data()?.status !== 'Processing refund' ? orderUpdateHandler() : refundOrderUpdateHandler()">Update Status</div>
  </div>`,
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
  data = computed(() => (this.orderStore.orders() || []).find((i) => i._id === this.route.snapshot.paramMap.get('id')));
  orderStatusOptions = computed(() => {
    const all = ['Processing', 'Transferred to delivery partner', 'Shipping', 'Received', 'On the way', 'Delivered'];
    return all.slice(all.indexOf(this.data()?.status as string));
  });
  refundStatusOptions = computed(() => {
    const all = ['Processing refund', 'Refund Success'];
    return all.slice(all.indexOf(this.data()?.status as string));
  });
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.orderStore.getAllOrdersOfShop(s._id); }
  async orderUpdateHandler() {
    try {
      await this.api.put(`${server}/order/update-order-status/${this.route.snapshot.paramMap.get('id')}`, { status: this.status() }, true);
      this.toast.success('Order updated!'); this.router.navigate(['/dashboard-orders']);
    } catch (e) { this.toast.error(this.api.message(e)); }
  }
  async refundOrderUpdateHandler() {
    const s = this.sellerStore.seller();
    try {
      await this.api.put(`${server}/order/order-refund-success/${this.route.snapshot.paramMap.get('id')}`, { status: this.status() }, true);
      this.toast.success('Order updated!');
      if (s) this.orderStore.getAllOrdersOfShop(s._id);
    } catch (e) { this.toast.error(this.api.message(e)); }
  }
}
