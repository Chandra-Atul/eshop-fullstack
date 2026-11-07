import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { EventStore, ProductStore, SellerStore } from '../../core/state';
import { server } from '../../config';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';
import { LoaderComponent } from '../layout/loader.component';

@Component({
  selector: 'app-shop-all-products',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" /></div>
  }`,
})
export class ShopAllProductsComponent implements OnInit {
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);
  isLoading = computed(() => this.productStore.isLoading());
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Product Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Name', minWidth: 180, flex: 1.4 },
    { field: 'price', headerName: 'Price', minWidth: 100, flex: 0.6 },
    { field: 'Stock', headerName: 'Stock', type: 'number', minWidth: 80, flex: 0.5 },
    { field: 'sold', headerName: 'Sold out', type: 'number', minWidth: 130, flex: 0.6 },
    { field: 'Preview', headerName: '', flex: 0.8, minWidth: 100, linkPrefix: '/product', icon: 'AiOutlineEye' },
    { field: 'Delete', headerName: '', flex: 0.8, minWidth: 120, actionIcon: 'AiOutlineDelete' },
  ];
  row = computed(() => (this.productStore.products() || []).map((i) => ({ id: i._id, name: i.name, price: 'US$ ' + i.discountPrice, Stock: i.stock, sold: i?.sold_out })));
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.productStore.getAllProductsShop(s._id); }
  onCellAction(e: any) { this.handleDelete(e.row.id); }
  handleDelete(id: string) { this.productStore.deleteProduct(id); window.location.reload(); }
}

@Component({
  selector: 'app-shop-all-events',
  standalone: true,
  imports: [DataTableComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" /></div>
  }`,
})
export class ShopAllEventsComponent implements OnInit {
  private eventStore = inject(EventStore);
  private sellerStore = inject(SellerStore);
  isLoading = computed(() => this.eventStore.isLoading());
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Product Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Name', minWidth: 180, flex: 1.4 },
    { field: 'price', headerName: 'Price', minWidth: 100, flex: 0.6 },
    { field: 'Stock', headerName: 'Stock', type: 'number', minWidth: 80, flex: 0.5 },
    { field: 'sold', headerName: 'Sold out', type: 'number', minWidth: 130, flex: 0.6 },
    { field: 'Preview', headerName: '', flex: 0.8, minWidth: 100, linkPrefix: '/product', icon: 'AiOutlineEye' },
    { field: 'Delete', headerName: '', flex: 0.8, minWidth: 120, actionIcon: 'AiOutlineDelete' },
  ];
  row = computed(() => (this.eventStore.events() || []).map((i) => ({ id: i._id, name: i.name, price: 'US$ ' + i.discountPrice, Stock: i.stock, sold: i.sold_out })));
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.eventStore.getAllEventsShop(s._id); }
  onCellAction(e: any) { this.handleDelete(e.row.id); }
  handleDelete(id: string) { this.eventStore.deleteEvent(id); window.location.reload(); }
}

@Component({
  selector: 'app-all-coupons',
  standalone: true,
  imports: [FormsModule, IconComponent, DataTableComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else {
    <div class="w-full mx-8 pt-1 mt-10 bg-white">
      <div class="w-full flex justify-end">
        <div class="{{ styles.button }} !w-max !h-[45px] px-3 !rounded-[5px] mr-3 mb-3" (click)="open.set(true)"><span class="text-white">Create Coupon Code</span></div>
      </div>
      <app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" />
      @if (open()) {
        <div class="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
          <div class="w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded-md shadow p-4">
            <div class="w-full flex justify-end"><app-icon name="RxCross1" [size]="30" class="cursor-pointer" (click)="open.set(false)" /></div>
            <h5 class="text-[30px] font-Poppins text-center">Create Coupon code</h5>
            <form (ngSubmit)="handleSubmit($event)"><br />
              <div><label class="pb-2">Name <span class="text-red-500">*</span></label>
                <input type="text" name="name" required [(ngModel)]="name" class="{{ inputClass }}" placeholder="Enter your coupon code name..." /></div><br />
              <div><label class="pb-2">Discount Percentenge <span class="text-red-500">*</span></label>
                <input type="text" name="value" [ngModel]="value()" (ngModelChange)="value.set($event)" required class="{{ inputClass }}" placeholder="Enter your coupon code value..." /></div><br />
              <div><label class="pb-2">Min Amount</label>
                <input type="number" name="minAmount" [ngModel]="minAmount()" (ngModelChange)="minAmount.set($event)" class="{{ inputClass }}" placeholder="Enter your coupon code min amount..." /></div><br />
              <div><label class="pb-2">Max Amount</label>
                <input type="number" name="maxAmount" [ngModel]="maxAmount()" (ngModelChange)="maxAmount.set($event)" class="{{ inputClass }}" placeholder="Enter your coupon code max amount..." /></div><br />
              <div><label class="pb-2">Selected Product</label>
                <select class="w-full mt-2 border h-[35px] rounded-[5px]" [value]="selectedProducts()" (change)="selectedProducts.set($any($event.target).value)">
                  <option value="Choose your selected products">Choose a selected product</option>
                  @for (i of products(); track i._id) { <option [value]="i.name">{{ i.name }}</option> }
                </select></div><br />
              <div><input type="submit" value="Create" class="{{ inputClass }}" /></div>
            </form>
          </div>
        </div>
      }
    </div>
  }`,
})
export class AllCouponsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private sellerStore = inject(SellerStore);
  private productStore = inject(ProductStore);
  styles = styles;
  inputClass = 'mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  open = signal(false);
  name = '';
  isLoading = signal(false);
  coupouns = signal<any[]>([]);
  minAmount = signal<any>(null); maxAmount = signal<any>(null); selectedProducts = signal<any>(null); value = signal<any>(null);
  products = computed(() => this.productStore.products() || []);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Coupon Code', minWidth: 180, flex: 1.4 },
    { field: 'price', headerName: 'Value', minWidth: 100, flex: 0.6 },
    { field: 'Delete', headerName: '', flex: 0.8, minWidth: 120, actionIcon: 'AiOutlineDelete' },
  ];
  row = computed(() => (this.coupouns() || []).map((i) => ({ id: i._id, name: i.name, price: i.value + ' %', sold: 10 })));
  async ngOnInit() {
    const seller = this.sellerStore.seller(); if (!seller) return;
    this.isLoading.set(true);
    try { const res: any = await this.api.get(`${server}/coupon/get-coupon/${seller._id}`, true); this.isLoading.set(false); this.coupouns.set(res.couponCodes); }
    catch (e) { this.isLoading.set(false); }
  }
  onCellAction(e: any) { this.handleDelete(e.row.id); }
  async handleDelete(id: string) {
    await this.api.delete(`${server}/coupon/delete-coupon/${id}`, true);
    this.toast.success('Coupon code deleted succesfully!');
    window.location.reload();
  }
  async handleSubmit(e: Event) {
    e.preventDefault();
    const seller = this.sellerStore.seller();
    try {
      await this.api.post(`${server}/coupon/create-coupon-code`, {
        name: this.name, minAmount: this.minAmount(), maxAmount: this.maxAmount(),
        selectedProducts: this.selectedProducts(), value: this.value(), shopId: seller?._id,
      }, true);
      this.toast.success('Coupon code created successfully!');
      this.open.set(false); window.location.reload();
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}
