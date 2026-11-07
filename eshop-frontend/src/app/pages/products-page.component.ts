import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../components/layout/footer.component';
import { HeaderComponent } from '../components/layout/header.component';
import { LoaderComponent } from '../components/layout/loader.component';
import { ProductCardComponent } from '../components/products/product-card.component';
import { styles } from '../styles';
import { ProductStore } from '../core/state';

@Component({ selector: 'app-products-page', standalone: true, imports: [FooterComponent, HeaderComponent, LoaderComponent, ProductCardComponent],
  template: `@if (isLoading()) { <app-loader /> } @else { <div><app-header [activeHeading]="3" /><br /><br />
    <div class="{{ styles.section }}">
      <div class="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
        @for (i of data(); track i._id) { <app-product-card [data]="i" /> }</div>
      @if (data().length === 0) { <h1 class="text-center w-full pb-[100px] text-[20px]">No products Found!</h1> }
    </div><app-footer /></div> }` })
export class ProductsPageComponent {
  private productStore = inject(ProductStore); private route = inject(ActivatedRoute);
  styles = styles;
  isLoading = computed(() => this.productStore.isLoading());
  data = computed(() => {
    const categoryData = this.route.snapshot.queryParamMap.get('category');
    const allProducts = this.productStore.allProducts() || [];
    return categoryData === null ? allProducts : allProducts.filter((i) => i.category === categoryData);
  });
}
