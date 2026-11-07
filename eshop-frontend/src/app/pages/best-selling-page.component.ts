import { Component, computed, inject } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { LoaderComponent } from '../components/layout/loader.component';
import { ProductCardComponent } from '../components/products/product-card.component';
import { FooterComponent } from '../components/layout/footer.component';
import { styles } from '../styles';
import { ProductStore } from '../core/state';

@Component({ selector: 'app-best-selling-page', standalone: true, imports: [HeaderComponent, LoaderComponent, ProductCardComponent, FooterComponent],
  template: `@if (isLoading()) { <app-loader /> } @else { <div><app-header [activeHeading]="2" /><br /><br />
    <div class="{{ styles.section }}"><div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
      @for (i of data(); track i._id) { <app-product-card [data]="i" /> }</div></div><app-footer /></div> }` })
export class BestSellingPageComponent {
  private productStore = inject(ProductStore);
  styles = styles;
  isLoading = computed(() => this.productStore.isLoading());
  data = computed(() => [...(this.productStore.allProducts() || [])].sort((a, b) => (b.sold_out ?? 0) - (a.sold_out ?? 0)));
}
