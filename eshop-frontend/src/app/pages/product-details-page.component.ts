import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../components/layout/footer.component';
import { HeaderComponent } from '../components/layout/header.component';
import { ProductDetailsComponent } from '../components/products/product-details.component';
import { SuggestedProductComponent } from '../components/products/suggested-product.component';
import { EventStore, ProductStore } from '../core/state';

@Component({ selector: 'app-product-details-page', standalone: true, imports: [FooterComponent, HeaderComponent, ProductDetailsComponent, SuggestedProductComponent],
  template: `<div><app-header />
    @if (data()) { <app-product-details [data]="data()!" /> }
    @if (!eventData && data()) { <app-suggested-product [data]="data()!" /> }
    <app-footer /></div>` })
export class ProductDetailsPageComponent {
  private productStore = inject(ProductStore); private eventStore = inject(EventStore); private route = inject(ActivatedRoute);
  eventData = this.route.snapshot.queryParamMap.get('isEvent');
  data = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    if (this.eventData !== null) return (this.eventStore.allEvents() || []).find((i) => i._id === id) as any;
    return (this.productStore.allProducts() || []).find((i) => i._id === id) as any;
  });
}
