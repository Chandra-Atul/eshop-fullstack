import { Component, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderStore, UserStore } from '../../core/state';

@Component({
  selector: 'app-track-order',
  standalone: true,
  template: `<div class="w-full h-[80vh] flex justify-center items-center">
    @if (data() && data()?.status === 'Processing') { <h1 class="text-[20px]">Your Order is processing in shop.</h1> }
    @else if (data()?.status === 'Transferred to delivery partner') { <h1 class="text-[20px]">Your Order is on the way for delivery partner.</h1> }
    @else if (data()?.status === 'Shipping') { <h1 class="text-[20px]">Your Order is on the way with our delivery partner.</h1> }
    @else if (data()?.status === 'Received') { <h1 class="text-[20px]">Your Order is in your city. Our Delivery man will deliver it.</h1> }
    @else if (data()?.status === 'On the way') { <h1 class="text-[20px]">Our Delivery man is going to deliver your order.</h1> }
    @else if (data()?.status === 'Delivered') { <h1 class="text-[20px]">Your order is delivered!</h1> }
    @else if (data()?.status === 'Processing refund') { <h1 class="text-[20px]">Your refund is processing!</h1> }
    @else if (data()?.status === 'Refund Success') { <h1 class="text-[20px]">Your Refund is success!</h1> }
  </div>`,
})
export class TrackOrderComponent implements OnInit {
  private orderStore = inject(OrderStore);
  private userStore = inject(UserStore);
  private route = inject(ActivatedRoute);
  data = computed(() => (this.orderStore.orders() || []).find((i) => i._id === this.route.snapshot.paramMap.get('id')));
  ngOnInit() { const user = this.userStore.user(); if (user) this.orderStore.getAllOrdersOfUser(user._id); }
}
