import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FooterComponent } from '../components/layout/footer.component';
import { HeaderComponent } from '../components/layout/header.component';
import { ProductDetailsComponent } from '../components/products/product-details.component';
import { SuggestedProductComponent } from '../components/products/suggested-product.component';
import { EventStore, ProductStore } from '../core/state';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, ProductDetailsComponent, SuggestedProductComponent],
  template: `
    <div>
      <app-header />
      @if (data()) {
        <app-product-details [data]="data()!" />
        @if (!isEvent() && data()) {
          <app-suggested-product [data]="data()!" />
        }
      } @else if (isLoading()) {
        <div class="w-full min-h-[50vh] flex items-center justify-center">
          <p class="text-gray-500 font-medium">Loading details...</p>
        </div>
      } @else {
        <div class="w-full min-h-[50vh] flex flex-col items-center justify-center">
          <h3 class="text-xl font-semibold text-gray-700">Product not found</h3>
          <p class="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        </div>
      }
      <app-footer />
    </div>
  `,
})
export class ProductDetailsPageComponent implements OnInit {
  private productStore = inject(ProductStore);
  private eventStore = inject(EventStore);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);

  // Reactively track route params and query params
  private params = toSignal(this.route.paramMap);
  private queryParams = toSignal(this.route.queryParamMap);

  isEvent = computed(() => {
    const qp = this.queryParams();
    return qp ? qp.get('isEvent') !== null : false;
  });

  data = computed(() => {
    const p = this.params();
    const id = p ? p.get('id') : this.route.snapshot.paramMap.get('id');
    if (!id || id === 'undefined') return null;

    if (this.isEvent()) {
      const events = this.eventStore.allEvents() || [];
      return events.find((i: any) => String(i._id || i.id) === String(id)) || null;
    }

    const products = this.productStore.allProducts() || [];
    return products.find((i: any) => String(i._id || i.id) === String(id)) || null;
  });

  async ngOnInit() {
    this.isLoading.set(true);

    try {
      if (this.isEvent()) {
        if ((this.eventStore.allEvents() || []).length === 0) {
          await this.eventStore.getAllEvents();
        }
      } else {
        if ((this.productStore.allProducts() || []).length === 0) {
          await this.productStore.getAllProducts();
        }
      }
    } catch (e) {
      console.error('Failed to load item list:', e);
    } finally {
      this.isLoading.set(false);
    }
  }
}