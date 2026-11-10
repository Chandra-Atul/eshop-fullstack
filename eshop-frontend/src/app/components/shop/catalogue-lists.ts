import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { EventStore, ProductStore, SellerStore } from '../../core/state';
import { server } from '../../config';
import { LoaderComponent } from '../layout/loader.component';

// ==========================================
// 1. SHOP ALL PRODUCTS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-products',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, LoaderComponent],
  host: {
    class: 'w-full block',
  },
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="w-full overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600 border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th class="py-3.5 px-4 min-w-[100px]">Product Id</th>
                <th class="py-3.5 px-4 min-w-[200px]">Name</th>
                <th class="py-3.5 px-4 min-w-[100px]">Price</th>
                <th class="py-3.5 px-4 min-w-[80px]">Stock</th>
                <th class="py-3.5 px-4 min-w-[100px]">Sold out</th>
                <th class="py-3.5 px-4 min-w-[80px] text-center">Preview</th>
                <th class="py-3.5 px-4 min-w-[80px] text-center">Delete</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of paginatedRows(); track item.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-mono text-xs text-gray-500">{{ item.id }}</td>
                  <td class="py-3 px-4 font-medium text-gray-900">{{ item.name }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.price }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.Stock }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.sold }}</td>
                  <td class="py-3 px-4 text-center">
                    <a [routerLink]="['/product', item.id]" class="text-blue-600 hover:text-blue-800 inline-block">
                      <app-icon name="AiOutlineEye" [size]="20" />
                    </a>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      type="button"
                      (click)="handleDelete(item.id)"
                      class="text-red-600 hover:text-red-800 cursor-pointer inline-block"
                    >
                      <app-icon name="AiOutlineDelete" [size]="20" />
                    </button>
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr>
                  <td colspan="7" class="py-10 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
          <span>Page {{ page() + 1 }} of {{ totalPages() }} (Total {{ rows().length }} products)</span>
          <div class="inline-flex gap-2">
            <button
              class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              [disabled]="page() === 0"
              (click)="page.set(page() - 1)"
            >
              Prev
            </button>
            <button
              class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              [disabled]="page() >= totalPages() - 1"
              (click)="page.set(page() + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShopAllProductsComponent implements OnInit {
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);

  isLoading = computed(() => this.productStore.isLoading());
  page = signal(0);
  pageSize = 10;

  rows = computed(() => {
    let list = this.productStore.products() || [];

    // Fallback if shop products list is empty: filter from allProducts
    if (list.length === 0) {
      const seller: any = this.sellerStore.seller();
      const currentShopId = seller?._id || seller?.id || '1';
      const all = this.productStore.allProducts() || [];

      list = all.filter((p: any) => {
        const pShopId = p.shopId ?? p.shop?.id ?? p.shop?._id ?? p.shop;
        return String(pShopId) === String(currentShopId);
      });
    }

    return list.map((i: any) => ({
      id: String(i._id || i.id || ''),
      name: i.name || 'Unnamed Product',
      price: 'US$ ' + (i.discountPrice ?? i.price ?? 0),
      Stock: i.stock ?? i.Stock ?? 0,
      sold: i?.sold_out || 0,
    }));
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize)));

  paginatedRows = computed(() => {
    const start = this.page() * this.pageSize;
    return this.rows().slice(start, start + this.pageSize);
  });

  async ngOnInit() {
    let seller: any = this.sellerStore.seller();

    if (!seller?._id && !seller?.id) {
      try {
        await this.sellerStore.loadSeller();
        seller = this.sellerStore.seller();
      } catch (err) {
        console.warn('Could not load seller:', err);
      }
    }

    const sellerId = seller?._id || seller?.id;

    if (sellerId) {
      try {
        await this.productStore.getAllProductsShop(String(sellerId));
      } catch {
        console.warn('getAllProductsShop failed, falling back to getAllProducts');
      }
    }

    await this.productStore.getAllProducts();
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await this.productStore.deleteProduct(id);
      this.toast.success('Product deleted successfully!');

      const seller: any = this.sellerStore.seller();
      const sellerId = seller?._id || seller?.id;
      if (sellerId) {
        this.productStore.getAllProductsShop(String(sellerId));
      }
      this.productStore.getAllProducts();
    } catch {
      this.toast.error('Failed to delete product');
    }
  }
}

// ==========================================
// 2. SHOP ALL EVENTS COMPONENT
// ==========================================
@Component({
  selector: 'app-shop-all-events',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, LoaderComponent],
  host: {
    class: 'w-full block',
  },
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="w-full overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600 border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th class="py-3.5 px-4 min-w-[100px]">Event Id</th>
                <th class="py-3.5 px-4 min-w-[200px]">Name</th>
                <th class="py-3.5 px-4 min-w-[100px]">Price</th>
                <th class="py-3.5 px-4 min-w-[80px]">Stock</th>
                <th class="py-3.5 px-4 min-w-[100px]">Sold out</th>
                <th class="py-3.5 px-4 min-w-[80px] text-center">Preview</th>
                <th class="py-3.5 px-4 min-w-[80px] text-center">Delete</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of paginatedRows(); track item.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-mono text-xs text-gray-500">{{ item.id }}</td>
                  <td class="py-3 px-4 font-medium text-gray-900">{{ item.name }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.price }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.Stock }}</td>
                  <td class="py-3 px-4 text-gray-700">{{ item.sold }}</td>
                  <td class="py-3 px-4 text-center">
                    <a [routerLink]="['/product', item.id]" [queryParams]="{ isEvent: true }" class="text-blue-600 hover:text-blue-800 inline-block">
                      <app-icon name="AiOutlineEye" [size]="20" />
                    </a>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <button
                      type="button"
                      (click)="handleDelete(item.id)"
                      class="text-red-600 hover:text-red-800 cursor-pointer inline-block"
                    >
                      <app-icon name="AiOutlineDelete" [size]="20" />
                    </button>
                  </td>
                </tr>
              }
              @if (rows().length === 0) {
                <tr>
                  <td colspan="7" class="py-10 text-center text-gray-400">
                    No events found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
          <span>Page {{ page() + 1 }} of {{ totalPages() }} (Total {{ rows().length }} events)</span>
          <div class="inline-flex gap-2">
            <button
              class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              [disabled]="page() === 0"
              (click)="page.set(page() - 1)"
            >
              Prev
            </button>
            <button
              class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              [disabled]="page() >= totalPages() - 1"
              (click)="page.set(page() + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShopAllEventsComponent implements OnInit {
  private eventStore = inject(EventStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);

  isLoading = computed(() => this.eventStore.isLoading());
  page = signal(0);
  pageSize = 10;

  rows = computed(() => {
    let list = this.eventStore.events() || [];

    // Fallback if shop events list is empty: filter from allEvents
    if (list.length === 0) {
      const seller: any = this.sellerStore.seller();
      const currentShopId = seller?._id || seller?.id || '1';
      const all = this.eventStore.allEvents() || [];

      list = all.filter((e: any) => {
        const eShopId = e.shopId ?? e.shop?.id ?? e.shop?._id ?? e.shop;
        return String(eShopId) === String(currentShopId);
      });
    }

    return list.map((i: any) => ({
      id: String(i._id || i.id || ''),
      name: i.name || 'Unnamed Event',
      price: 'US$ ' + (i.discountPrice ?? i.price ?? 0),
      Stock: i.stock ?? i.Stock ?? 0,
      sold: i.sold_out || 0,
    }));
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize)));

  paginatedRows = computed(() => {
    const start = this.page() * this.pageSize;
    return this.rows().slice(start, start + this.pageSize);
  });

  async ngOnInit() {
    let seller: any = this.sellerStore.seller();

    if (!seller?._id && !seller?.id) {
      try {
        await this.sellerStore.loadSeller();
        seller = this.sellerStore.seller();
      } catch (err) {
        console.warn('Could not load seller:', err);
      }
    }

    const sellerId = seller?._id || seller?.id;

    if (sellerId) {
      try {
        await this.eventStore.getAllEventsShop(String(sellerId));
      } catch {
        console.warn('getAllEventsShop failed, falling back to getAllEvents');
      }
    }

    // Always fetch all events to populate the fallback
    await this.eventStore.getAllEvents();
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await this.eventStore.deleteEvent(id);
      this.toast.success('Event deleted successfully!');

      const seller: any = this.sellerStore.seller();
      const sellerId = seller?._id || seller?.id;
      if (sellerId) {
        this.eventStore.getAllEventsShop(String(sellerId));
      }
      this.eventStore.getAllEvents();
    } catch {
      this.toast.error('Failed to delete event');
    }
  }
}

// ==========================================
// 3. ALL COUPONS COMPONENT
// ==========================================
@Component({
  selector: 'app-all-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, LoaderComponent],
  host: {
    class: 'w-full block',
  },
  template: `
    @if (isLoading()) {
      <app-loader />
    } @else {
      <div class="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div class="w-full flex justify-end p-4">
          <div
            class="{{ styles.button }} !w-max !h-[42px] px-4 !rounded-[6px] cursor-pointer"
            (click)="open.set(true)"
          >
            <span class="text-white text-sm font-medium">Create Coupon Code</span>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600 border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th class="py-3.5 px-4 min-w-[120px]">Coupon Id</th>
                <th class="py-3.5 px-4 min-w-[180px]">Coupon Code</th>
                <th class="py-3.5 px-4 min-w-[100px]">Discount</th>
                <th class="py-3.5 px-4 min-w-[80px] text-center">Delete</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (item of coupouns(); track item._id || item.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-3 px-4 font-mono text-xs text-gray-500">{{ item._id || item.id }}</td>
                  <td class="py-3 px-4 font-medium text-gray-900">{{ item.name }}</td>
                  <td class="py-3 px-4 text-green-600 font-medium">{{ item.value }} %</td>
                  <td class="py-3 px-4 text-center">
                    <button
                      type="button"
                      (click)="handleDelete(item._id || item.id)"
                      class="text-red-600 hover:text-red-800 cursor-pointer inline-block"
                    >
                      <app-icon name="AiOutlineDelete" [size]="20" />
                    </button>
                  </td>
                </tr>
              }
              @if (coupouns().length === 0) {
                <tr>
                  <td colspan="4" class="py-10 text-center text-gray-400">
                    No coupons found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (open()) {
          <div class="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
            <div class="w-[90%] 800px:w-[40%] max-h-[85vh] overflow-y-auto bg-white rounded-md shadow p-6">
              <div class="w-full flex justify-end">
                <app-icon name="RxCross1" [size]="26" class="cursor-pointer" (click)="open.set(false)" />
              </div>
              <h5 class="text-[24px] font-semibold text-center text-gray-800">Create Coupon Code</h5>

              <form (ngSubmit)="handleSubmit($event)" class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    required
                    [(ngModel)]="name"
                    class="{{ inputClass }}"
                    placeholder="Enter coupon code name..."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Discount Percentage <span class="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="value"
                    required
                    [ngModel]="value()"
                    (ngModelChange)="value.set($event)"
                    class="{{ inputClass }}"
                    placeholder="e.g. 10"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Min Amount</label>
                  <input
                    type="number"
                    name="minAmount"
                    [ngModel]="minAmount()"
                    (ngModelChange)="minAmount.set($event)"
                    class="{{ inputClass }}"
                    placeholder="Enter min amount..."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Max Amount</label>
                  <input
                    type="number"
                    name="maxAmount"
                    [ngModel]="maxAmount()"
                    (ngModelChange)="maxAmount.set($event)"
                    class="{{ inputClass }}"
                    placeholder="Enter max amount..."
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Selected Product</label>
                  <select
                    class="w-full mt-2 border border-gray-300 h-[38px] px-2 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
                    [value]="selectedProducts()"
                    (change)="selectedProducts.set($any($event.target).value)"
                  >
                    <option value="">Choose a product (optional)</option>
                    @for (i of products(); track i._id || i.id) {
                      <option [value]="i.name">{{ i.name }}</option>
                    }
                  </select>
                </div>

                <div class="pt-2">
                  <input
                    type="submit"
                    value="Create Coupon"
                    class="w-full h-[40px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[4px] cursor-pointer transition-colors"
                  />
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class AllCouponsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private sellerStore = inject(SellerStore);
  private productStore = inject(ProductStore);

  styles = styles;
  inputClass =
      'mt-1 appearance-none block w-full px-3 h-[38px] border border-gray-300 rounded-[4px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';

  open = signal(false);
  name = '';
  isLoading = signal(false);
  coupouns = signal<any[]>([]);

  minAmount = signal<number | null>(null);
  maxAmount = signal<number | null>(null);
  selectedProducts = signal<string>('');
  value = signal<number | null>(null);

  products = computed(() => this.productStore.products() || []);

  async ngOnInit() {
    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }

    const sellerId = seller?._id || seller?.id;
    if (sellerId) {
      this.fetchCoupons(String(sellerId));
      this.productStore.getAllProductsShop(String(sellerId));
    }
  }

  async fetchCoupons(shopId: string) {
    this.isLoading.set(true);
    try {
      const res: any = await this.api.get(`${server}/coupon/get-coupon/${shopId}`, true);
      this.coupouns.set(res.couponCodes || res.coupons || []);
    } catch {
      this.coupouns.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coupon code?')) return;
    try {
      await this.api.delete(`${server}/coupon/delete-coupon/${id}`, true);
      this.toast.success('Coupon code deleted successfully!');
      this.coupouns.update((items) => items.filter((c) => (c._id || c.id) !== id));
    } catch (e: any) {
      this.toast.error(this.api.message(e));
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }
    const sellerId = seller?._id || seller?.id;
    if (!sellerId) return;

    try {
      const res: any = await this.api.post(
          `${server}/coupon/create-coupon-code`,
          {
            name: this.name,
            minAmount: this.minAmount(),
            maxAmount: this.maxAmount(),
            selectedProducts: this.selectedProducts(),
            value: this.value(),
            shopId: sellerId,
          },
          true
      );

      this.toast.success('Coupon code created successfully!');
      if (res?.couponCode || res?.coupon) {
        this.coupouns.update((prev) => [...prev, res.couponCode || res.coupon]);
      } else {
        await this.fetchCoupons(String(sellerId));
      }

      this.name = '';
      this.value.set(null);
      this.minAmount.set(null);
      this.maxAmount.set(null);
      this.selectedProducts.set('');
      this.open.set(false);
    } catch (error) {
      this.toast.error(this.api.message(error));
    }
  }
}