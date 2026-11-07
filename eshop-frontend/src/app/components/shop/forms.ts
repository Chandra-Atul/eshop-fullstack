import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { EventStore, OrderStore, ProductStore, SellerStore } from '../../core/state';
import { server } from '../../config';
import { categoriesData } from '../../static/data';
import { imageFileResizer } from '../../shared/image-resizer';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
    <h5 class="text-[30px] font-Poppins text-center">Create Product</h5>
    <form (ngSubmit)="handleSubmit($event)"><br />
      <div><label class="pb-2">Name <span class="text-red-500">*</span></label><input type="text" name="name" [(ngModel)]="name" [class]="inputClass" placeholder="Enter your product name..." /></div><br />
      <div><label class="pb-2">Description <span class="text-red-500">*</span></label><textarea cols="30" required rows="8" name="description" [(ngModel)]="description" [class]="inputClass" placeholder="Enter your product description..."></textarea></div><br />
      <div><label class="pb-2">Category <span class="text-red-500">*</span></label>
        <select class="w-full mt-2 border h-[35px] rounded-[5px]" [value]="category()" (change)="category.set($any($event.target).value)">
          <option value="Choose a category">Choose a category</option>
          @for (i of categoriesData; track i.title) { <option [value]="i.title">{{ i.title }}</option> }
        </select></div><br />
      <div><label class="pb-2">Tags</label><input type="text" name="tags" [(ngModel)]="tags" [class]="inputClass" placeholder="Enter your product tags..." /></div><br />
      <div><label class="pb-2">Original Price</label><input type="number" name="originalPrice" [ngModel]="originalPrice()" (ngModelChange)="originalPrice.set($event)" [class]="inputClass" placeholder="Enter your product price..." /></div><br />
      <div><label class="pb-2">Price (With Discount) <span class="text-red-500">*</span></label><input type="number" name="discountPrice" [ngModel]="discountPrice()" (ngModelChange)="discountPrice.set($event)" [class]="inputClass" placeholder="Enter your product price with discount..." /></div><br />
      <div><label class="pb-2">Product Stock <span class="text-red-500">*</span></label><input type="number" name="stock" [ngModel]="stock()" (ngModelChange)="stock.set($event)" [class]="inputClass" placeholder="Enter your product stock..." /></div><br />
      <div><label class="pb-2">Upload Images <span class="text-red-500">*</span></label>
        <input type="file" id="upload" class="hidden" multiple (change)="handleImageChange($event)" />
        <div class="w-full flex items-center flex-wrap"><label for="upload"><app-icon name="AiOutlinePlusCircle" [size]="30" class="mt-3" color="#555" /></label>
          @for (i of images(); track $index) { <img [src]="i" alt="" class="h-[120px] w-[120px] object-cover m-2" /> }</div><br />
        <div><input type="submit" value="Create" [class]="inputClass + ' mt-2 cursor-pointer text-center'" /></div></div>
    </form>
  </div>`,
})
export class CreateProductComponent {
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);
  private router = inject(Router);
  inputClass = 'w-full mt-2 appearance-none block px-3 h-[35px] border border-gray-300 rounded-[3px] text-sm';
  categoriesData = categoriesData;
  images = signal<string[]>([]);
  name = ''; description = ''; category = signal(''); tags = '';
  originalPrice = signal<any>(null); discountPrice = signal<any>(null); stock = signal<any>(null);
  constructor() {
    effect(() => {
      const error = this.productStore.error();
      if (error) this.toast.error(error);
      if (this.productStore.success()) { this.toast.success('Product created successfully!'); this.router.navigate(['/dashboard']); window.location.reload(); }
    });
  }
  async handleImageChange(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    this.images.set([]);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => { reader.onload = () => { if (reader.readyState === 2) this.images.update((o) => [...o, reader.result as string]); resolve(); }; reader.readAsDataURL(file); });
    }
  }
  handleSubmit(e: Event) {
    e.preventDefault();
    const seller = this.sellerStore.seller();
    this.productStore.createProduct(this.name, this.description, this.category(), this.tags, this.originalPrice(), this.discountPrice(), this.stock(), seller?._id as string, this.images());
  }
}

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
    <h5 class="text-[30px] font-Poppins text-center">Create Event</h5>
    <form (ngSubmit)="handleSubmit($event)"><br />
      <div><label class="pb-2">Name <span class="text-red-500">*</span></label><input type="text" name="name" [(ngModel)]="name" [class]="inputClass" placeholder="Enter your event product name..." /></div><br />
      <div><label class="pb-2">Description <span class="text-red-500">*</span></label><textarea cols="30" required rows="8" name="description" [(ngModel)]="description" [class]="inputClass" placeholder="Enter your event product description..."></textarea></div><br />
      <div><label class="pb-2">Category <span class="text-red-500">*</span></label>
        <select class="w-full mt-2 border h-[35px] rounded-[5px]" [value]="category()" (change)="category.set($any($event.target).value)">
          <option value="Choose a category">Choose a category</option>
          @for (i of categoriesData; track i.title) { <option [value]="i.title">{{ i.title }}</option> }
        </select></div><br />
      <div><label class="pb-2">Tags</label><input type="text" name="tags" [(ngModel)]="tags" [class]="inputClass" placeholder="Enter your event product tags..." /></div><br />
      <div><label class="pb-2">Original Price</label><input type="number" name="originalPrice" [ngModel]="originalPrice()" (ngModelChange)="originalPrice.set($event)" [class]="inputClass" placeholder="Enter your event product price..." /></div><br />
      <div><label class="pb-2">Price (With Discount) <span class="text-red-500">*</span></label><input type="number" name="discountPrice" [ngModel]="discountPrice()" (ngModelChange)="discountPrice.set($event)" [class]="inputClass" placeholder="Enter your event product price with discount..." /></div><br />
      <div><label class="pb-2">Product Stock <span class="text-red-500">*</span></label><input type="number" name="stock" [ngModel]="stock()" (ngModelChange)="stock.set($event)" [class]="inputClass" placeholder="Enter your event product stock..." /></div><br />
      <div><label class="pb-2">Event Start Date <span class="text-red-500">*</span></label><input type="date" name="startDate" [value]="startDateValue()" [min]="today" (change)="handleStartDateChange($event)" [class]="inputClass" /></div><br />
      <div><label class="pb-2">Event End Date <span class="text-red-500">*</span></label><input type="date" name="endDate" [value]="endDateValue()" [min]="minEndDate()" (change)="handleEndDateChange($event)" [class]="inputClass" /></div><br />
      <div><label class="pb-2">Upload Images <span class="text-red-500">*</span></label>
        <input type="file" id="upload" class="hidden" multiple (change)="handleImageChange($event)" />
        <div class="w-full flex items-center flex-wrap"><label for="upload"><app-icon name="AiOutlinePlusCircle" [size]="30" class="mt-3" color="#555" /></label>
          @for (i of images(); track $index) { <img [src]="i" alt="" class="h-[120px] w-[120px] object-cover m-2" /> }</div><br />
        <div><input type="submit" value="Create" [class]="inputClass + ' mt-2 cursor-pointer text-center'" /></div></div>
    </form>
  </div>`,
})
export class CreateEventComponent {
  private eventStore = inject(EventStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);
  private router = inject(Router);
  inputClass = 'w-full mt-2 appearance-none block px-3 h-[35px] border border-gray-300 rounded-[3px] text-sm';
  categoriesData = categoriesData;
  images = signal<string[]>([]);
  name = ''; description = ''; category = signal(''); tags = '';
  originalPrice = signal<any>(null); discountPrice = signal<any>(null); stock = signal<any>(null);
  startDate = signal<Date | null>(null); endDate = signal<Date | null>(null);
  today = new Date().toISOString().slice(0, 10);
  startDateValue = () => (this.startDate() ? this.startDate()!.toISOString().slice(0, 10) : '');
  endDateValue = () => (this.endDate() ? this.endDate()!.toISOString().slice(0, 10) : '');
  minEndDate = () => (this.startDate() ? new Date(this.startDate()!.getTime() + 3 * 86400000).toISOString().slice(0, 10) : '');
  constructor() {
    effect(() => {
      const error = this.eventStore.error();
      if (error) this.toast.error(error);
      if (this.eventStore.success()) { this.toast.success('Event created successfully!'); this.router.navigate(['/dashboard-events']); window.location.reload(); }
    });
  }
  handleStartDateChange(e: Event) { this.startDate.set(new Date((e.target as HTMLInputElement).value)); this.endDate.set(null); }
  handleEndDateChange(e: Event) { this.endDate.set(new Date((e.target as HTMLInputElement).value)); }
  async handleImageChange(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    this.images.set([]);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => { reader.onload = () => { if (reader.readyState === 2) this.images.update((o) => [...o, reader.result as string]); resolve(); }; reader.readAsDataURL(file); });
    }
  }
  handleSubmit(e: Event) {
    e.preventDefault();
    const seller = this.sellerStore.seller();
    this.eventStore.createEvent({
      name: this.name, description: this.description, category: this.category(), tags: this.tags,
      originalPrice: this.originalPrice(), discountPrice: this.discountPrice(), stock: this.stock(),
      images: this.images(), shopId: seller?._id,
      start_Date: this.startDate()?.toISOString(), Finish_Date: this.endDate()?.toISOString(),
    });
  }
}
