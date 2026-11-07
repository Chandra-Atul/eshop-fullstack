import { Component, Input, computed, inject } from '@angular/core';
import { styles } from '../../styles';
import { ProductStore } from '../../core/state';
import { Product } from '../../core/models';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-suggested-product',
  standalone: true,
  imports: [ProductCardComponent],
  template: `<div>@if (data) {
    <div class="p-4 {{ styles.section }}">
      <h2 class="{{ styles.heading }} text-[25px] font-[500] border-b mb-5">Related Product</h2>
      <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
        @for (i of productData(); track i._id) { <app-product-card [data]="i" /> }
      </div>
    </div>
  }</div>`,
})
export class SuggestedProductComponent {
  private productStore = inject(ProductStore);
  @Input() data!: Product;
  styles = styles;
  productData = computed(() => (this.productStore.allProducts() || []).filter((i) => i.category === this.data?.category));
}
