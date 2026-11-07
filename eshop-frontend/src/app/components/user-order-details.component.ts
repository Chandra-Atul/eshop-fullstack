import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  template: `<div class="py-4 min-h-screen {{ styles.section }}">
    <div class="w-full flex items-center justify-between"><div class="flex items-center">
      <app-icon name="BsFillBagFill" [size]="30" color="crimson" /><h1 class="pl-2 text-[25px]">Order Details</h1></div></div>
    <div class="w-full flex items-center justify-between pt-6">
      <h5 class="text-[#00000084]">Order ID: <span>#{{ data()?._id?.slice(0, 8) }}</span></h5>
      <h5 class="text-[#00000084]">Placed on: <span>{{ data()?.createdAt?.slice(0, 10) }}</span></h5></div>
    <br /><br /><br />
    @if (data()) {
      @for (item of data()!.cart; track item._id) {
        <div class="w-full flex items-start mb-5">
          <img [src]="item.images[0]?.url" alt="" class="w-[80px] h-[80px]" />
          <div class="w-full"><h5 class="pl-3 text-[20px]">{{ item.name }}</h5>
            <h5 class="pl-3 text-[20px] text-[#00000091]">US&#36;{{ item.discountPrice }} x {{ item.qty }}</h5></div>
          @if (!item.isReviewed && data()?.status === 'Delivered') {
            <div class="{{ styles.button }} text-[#fff]" (click)="openReview(item)">Write a review</div>
          }
        </div>
      }
    }
    @if (open()) {
      <div class="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
        <div class="w-[50%] h-min bg-[#fff] shadow rounded-md p-3">
          <div class="w-full flex justify-end p-3"><app-icon name="RxCross1" [size]="30" class="cursor-pointer" (click)="open.set(false)" /></div>
          <h2 class="text-[30px] font-[500] font-Poppins text-center">Give a Review</h2><br />
          <div class="w-full flex"><img [src]="selectedItem()?.images[0]?.url" alt="" class="w-[80px] h-[80px]" />
            <div><div class="pl-3 text-[20px]">{{ selectedItem()?.name }}</div>
              <h4 class="pl-3 text-[20px]">US&#36;{{ selectedItem()?.discountPrice }} x {{ selectedItem()?.qty }}</h4></div></div>
          <br /><br />
          <h5 class="pl-3 text-[20px] font-[500]">Give a Rating <span class="text-red-500">*</span></h5>
          <div class="flex w-full ml-2 pt-1">
            @for (i of [1,2,3,4,5]; track i) {
              @if (rating() >= i) { <app-icon name="AiFillStar" [size]="25" color="rgb(246,186,0)" class="mr-1 cursor-pointer" (click)="rating.set(i)" /> }
              @else { <app-icon name="AiOutlineStar" [size]="25" color="rgb(246,186,0)" class="mr-1 cursor-pointer" (click)="rating.set(i)" /> }
            }
          </div><br />
          <div class="w-full ml-3"><label class="block text-[20px] font-[500]">Write a comment
            <span class="ml-1 font-[400] text-[16px] text-[#00000052]">(optional)</span></label>
            <textarea name="comment" cols="20" rows="5" [ngModel]="comment()" (ngModelChange)="comment.set($event)" name="comment" placeholder="How was your product? write your expresion about it!" class="mt-2 w-[95%] border p-2 outline-none"></textarea></div>
          <div class="{{ styles.button }} text-white text-[20px] ml-3" (click)="rating() > 1 ? reviewHandler() : null">Submit</div>
        </div>
      </div>
    }
    <div class="border-t w-full text-right"><h5 class="pt-3 text-[18px]">Total Price: <strong>US&#36;{{ data()?.totalPrice }}</strong></h5></div><br /><br />
    <div class="w-full 800px:flex items-center">
      <div class="w-full 800px:w-[60%]">
        <h4 class="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
        <h4 class="pt-3 text-[20px]">{{ data()?.shippingAddress?.address1 }} {{ data()?.shippingAddress?.address2 }}</h4>
        <h4 class="text-[20px]">{{ data()?.shippingAddress?.country }}</h4>
        <h4 class="text-[20px]">{{ data()?.shippingAddress?.city }}</h4>
        <h4 class="text-[20px]">{{ data()?.user?.phoneNumber }}</h4>
      </div>
      <div class="w-full 800px:w-[40%]">
        <h4 class="pt-3 text-[20px]">Payment Info:</h4>
        <h4>Status: {{ data()?.paymentInfo?.status ? data()?.paymentInfo?.status : 'Not Paid' }}</h4><br />
        @if (data()?.status === 'Delivered') { <div class="{{ styles.button }} text-white" (click)="refundHandler()">Give a Refund</div> }
      </div>
    </div><br />
    <a routerLink="/"><div class="{{ styles.button }} text-white">Send Message</div></a><br /><br />
  </div>`,
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
  rating = signal(1);
  data = computed(() => (this.orderStore.orders() || []).find((i) => i._id === this.route.snapshot.paramMap.get('id')));
  ngOnInit() { const user = this.userStore.user(); if (user) this.orderStore.getAllOrdersOfUser(user._id); }
  openReview(item: any) { this.open.set(true); this.selectedItem.set(item); }
  async reviewHandler() {
    const user = this.userStore.user();
    try {
      const res: any = await this.api.put(`${server}/product/create-new-review`, {
        user, rating: this.rating(), comment: this.comment(),
        productId: this.selectedItem()?._id, orderId: this.route.snapshot.paramMap.get('id'),
      }, true);
      this.toast.success(res.message);
      if (user) this.orderStore.getAllOrdersOfUser(user._id);
      this.comment.set(''); this.rating.set(null as any); this.open.set(false);
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
  async refundHandler() {
    const user = this.userStore.user();
    try {
      const res: any = await this.api.put(`${server}/order/order-refund/${this.route.snapshot.paramMap.get('id')}`, { status: 'Processing refund' });
      this.toast.success(res.message);
      if (user) this.orderStore.getAllOrdersOfUser(user._id);
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}
