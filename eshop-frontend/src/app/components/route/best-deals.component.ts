import { Component, computed, inject } from '@angular/core';
import { styles } from '../../styles';
import { ProductStore } from '../../core/state';
import { ProductCardComponent } from '../products/product-card.component';

@Component({
  selector: 'app-best-deals',
  standalone: true,
  imports: [ProductCardComponent],
  template: `<div><div class="{{ styles.section }}">
    <div class="{{ styles.heading }}"><h1>Best Deals</h1></div>
    <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
      @if (data().length !== 0) { @for (i of data(); track i._id) { <app-product-card [data]="i" /> } }
    </div>
  </div></div>`,
})
export class BestDealsComponent {
  private productStore = inject(ProductStore);
  styles = styles;
  data = computed(() => {
    const all = [...(this.productStore.allProducts() || [])];
    return all.sort((a, b) => (b.sold_out ?? 0) - (a.sold_out ?? 0)).slice(0, 5);
  });
}
