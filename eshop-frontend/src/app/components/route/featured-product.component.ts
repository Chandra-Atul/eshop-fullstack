import { Component, computed, inject } from '@angular/core';
import { styles } from '../../styles';
import { ProductStore } from '../../core/state';
import { ProductCardComponent } from '../products/product-card.component';

@Component({
  selector: 'app-featured-product',
  standalone: true,
  imports: [ProductCardComponent],
  template: `<div><div class="{{ styles.section }}">
    <div class="{{ styles.heading }}"><h1>Featured Products</h1></div>
    <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
      @if (allProducts().length !== 0) { @for (i of allProducts(); track i._id) { <app-product-card [data]="i" /> } }
    </div>
  </div></div>`,
})
export class FeaturedProductComponent {
  private productStore = inject(ProductStore);
  styles = styles;
  allProducts = computed(() => this.productStore.allProducts() || []);
}
