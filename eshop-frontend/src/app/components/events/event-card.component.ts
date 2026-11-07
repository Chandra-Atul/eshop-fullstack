import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { styles } from '../../styles';
import { CartStore } from '../../core/state';
import { ToastService } from '../../core/toast.service';
import { EventModel } from '../../core/models';
import { CountDownComponent } from './count-down.component';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink, CountDownComponent],
  template: `<div class="w-full block bg-white rounded-lg {{ active ? 'unset' : 'mb-12' }} lg:flex p-2">
    <div class="w-full lg:-w[50%] m-auto"><img [src]="data.images[0]?.url" alt="" /></div>
    <div class="w-full lg:[w-50%] flex flex-col justify-center">
      <h2 class="{{ styles.productTitle }}">{{ data.name }}</h2>
      <p>{{ data.description }}</p>
      <div class="flex py-2 justify-between">
        <div class="flex">
          <h5 class="font-[500] text-[18px] text-[#d55b45] pr-3 line-through">{{ data.originalPrice }}$</h5>
          <h5 class="font-bold text-[20px] text-[#333] font-Roboto">{{ data.discountPrice }}$</h5>
        </div>
        <span class="pr-3 font-[400] text-[17px] text-[#44a55e]">{{ data.sold_out }} sold</span>
      </div>
      <app-count-down [data]="data" /><br />
      <div class="flex items-center">
        <a [routerLink]="['/product', data._id]" [queryParams]="{ isEvent: 'true' }"><div class="{{ styles.button }} text-[#fff]">See Details</div></a>
        <div class="{{ styles.button }} text-[#fff] ml-5" (click)="addToCartHandler(data)">Add to cart</div>
      </div>
    </div>
  </div>`,
})
export class EventCardComponent {
  private cartStore = inject(CartStore);
  private toast = inject(ToastService);
  @Input() active?: boolean;
  @Input() data!: EventModel;
  styles = styles;
  addToCartHandler(data: EventModel) {
    const exists = this.cartStore.cart().find((i) => i._id === data._id);
    if (exists) { this.toast.error('Item already in cart!'); }
    else if (data.stock < 1) { this.toast.error('Product stock limited!'); }
    else { this.cartStore.addTocart({ ...data, qty: 1 } as any); this.toast.success('Item added to cart successfully!'); }
  }
}
