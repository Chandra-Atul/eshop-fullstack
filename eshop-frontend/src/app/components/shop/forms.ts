import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { ToastService } from '../../core/toast.service';
import { EventStore, ProductStore, SellerStore } from '../../core/state';
import { categoriesData } from '../../static/data';

// Helper to downscale large image files to prevent 413 Payload Too Large
const resizeImageToBase64 = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// ==========================================
// 1. CREATE PRODUCT COMPONENT
// ==========================================
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [FormsModule, IconComponent],
  host: {
    class: 'w-full flex justify-center',
    style: 'display: flex; width: 100%; justify-content: center;',
  },
  template: `
    <div class="w-full max-w-[750px] bg-white shadow-md h-[80vh] rounded-[8px] p-6 overflow-y-auto border border-gray-100">
      <h5 class="text-[28px] font-Poppins font-semibold text-center text-gray-800">Create Product</h5>

      <form (ngSubmit)="handleSubmit($event)" class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
          <input type="text" name="name" [(ngModel)]="name" [class]="inputClass" placeholder="Enter product name..." required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Description <span class="text-red-500">*</span></label>
          <textarea
            rows="5"
            name="description"
            [(ngModel)]="description"
            class="w-full mt-2 block px-3 py-2 border border-gray-300 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product description..."
            required
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
          <select
            class="w-full mt-2 border border-gray-300 h-[38px] px-2 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
            [value]="category()"
            (change)="category.set($any($event.target).value)"
            required
          >
            <option value="">Choose a category</option>
            @for (i of categoriesData; track i.title) {
              <option [value]="i.title">{{ i.title }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Tags</label>
          <input type="text" name="tags" [(ngModel)]="tags" [class]="inputClass" placeholder="e.g. fashion, summer" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Original Price</label>
            <input
              type="number"
              name="originalPrice"
              [ngModel]="originalPrice()"
              (ngModelChange)="originalPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Price (With Discount) <span class="text-red-500">*</span></label>
            <input
              type="number"
              name="discountPrice"
              [ngModel]="discountPrice()"
              (ngModelChange)="discountPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1499"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Product Stock <span class="text-red-500">*</span></label>
          <input
            type="number"
            name="stock"
            [ngModel]="stock()"
            (ngModelChange)="stock.set($event)"
            [class]="inputClass"
            placeholder="e.g. 50"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Upload Images <span class="text-red-500">*</span></label>
          <input type="file" id="upload-product-img" class="hidden" multiple accept="image/*" (change)="handleImageChange($event)" />

          <div class="w-full flex items-center flex-wrap gap-2 mt-2">
            <label for="upload-product-img" class="cursor-pointer p-3 border-2 border-dashed border-gray-300 rounded hover:border-gray-400">
              <app-icon name="AiOutlinePlusCircle" [size]="30" color="#555" />
            </label>

            @for (img of images(); track $index) {
              <div class="relative">
                <img [src]="img" alt="Uploaded preview" class="h-[100px] w-[100px] object-cover rounded border" />
                <button
                  type="button"
                  (click)="removeImage($index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full h-[40px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-[4px] cursor-pointer transition-colors"
          >
            {{ isLoading() ? 'Creating...' : 'Create Product' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateProductComponent {
  private productStore = inject(ProductStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);
  private router = inject(Router);

  inputClass =
      'w-full mt-2 block px-3 h-[38px] border border-gray-300 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500';

  categoriesData = categoriesData;
  images = signal<string[]>([]);
  name = '';
  description = '';
  category = signal('');
  tags = '';
  originalPrice = signal<number | null>(null);
  discountPrice = signal<number | null>(null);
  stock = signal<number | null>(null);
  isLoading = signal(false);

  constructor() {
    effect(() => {
      const error = this.productStore.error();
      if (error) {
        this.toast.error(error);
        this.isLoading.set(false);
      }

      if (this.productStore.success()) {
        this.toast.success('Product created successfully!');
        this.productStore.success.set(undefined);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard-products']);
      }
    });
  }

  async handleImageChange(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const compressedBase64 = await resizeImageToBase64(file);
        this.images.update((prev) => [...prev, compressedBase64]);
      } catch (err) {
        this.toast.error('Failed to load image');
      }
    }
  }

  removeImage(index: number) {
    this.images.update((prev) => prev.filter((_, i) => i !== index));
  }

  async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.name.trim()) {
      this.toast.error('Product name is required.');
      return;
    }
    if (!this.category() || this.category() === 'Choose a category') {
      this.toast.error('Please choose a valid category.');
      return;
    }
    if (!this.discountPrice()) {
      this.toast.error('Discount price is required.');
      return;
    }
    if (this.images().length === 0) {
      this.toast.error('Please upload at least one image.');
      return;
    }

    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }

    const sellerId = seller?._id || (seller?.id ? String(seller.id) : null);

    if (!sellerId) {
      console.error('Seller session not found:', seller);
      this.toast.error('Seller session not found. Please log in again.');
      this.router.navigate(['/shop-login']);
      return;
    }

    try {
      this.isLoading.set(true);

      await this.productStore.createProduct(
          this.name,
          this.description,
          this.category(),
          this.tags,
          Number(this.originalPrice()) || 0,
          Number(this.discountPrice()) || 0,
          Number(this.stock()) || 0,
          sellerId,
          this.images()
      );

      this.toast.success('Product created successfully!');
      this.isLoading.set(false);

      this.name = '';
      this.description = '';
      this.category.set('');
      this.tags = '';
      this.images.set([]);
      this.originalPrice.set(null);
      this.discountPrice.set(null);
      this.stock.set(null);

      await this.router.navigate(['/dashboard-products']);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      this.isLoading.set(false);
      this.toast.error(err?.message || 'Failed to create product');
    }
  }
}

// ==========================================
// 2. CREATE EVENT COMPONENT
// ==========================================
@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule, IconComponent],
  host: {
    class: 'w-full flex justify-center',
    style: 'display: flex; width: 100%; justify-content: center;',
  },
  template: `
    <div class="w-full max-w-[750px] bg-white shadow-md h-[80vh] rounded-[8px] p-6 overflow-y-auto border border-gray-100">
      <h5 class="text-[28px] font-Poppins font-semibold text-center text-gray-800">Create Event</h5>

      <form (ngSubmit)="handleSubmit($event)" class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
          <input type="text" name="name" [(ngModel)]="name" [class]="inputClass" placeholder="Enter event product name..." required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Description <span class="text-red-500">*</span></label>
          <textarea
            rows="5"
            name="description"
            [(ngModel)]="description"
            class="w-full mt-2 block px-3 py-2 border border-gray-300 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter event description..."
            required
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
          <select
            class="w-full mt-2 border border-gray-300 h-[38px] px-2 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500"
            [value]="category()"
            (change)="category.set($any($event.target).value)"
            required
          >
            <option value="">Choose a category</option>
            @for (i of categoriesData; track i.title) {
              <option [value]="i.title">{{ i.title }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Tags</label>
          <input type="text" name="tags" [(ngModel)]="tags" [class]="inputClass" placeholder="e.g. flash-sale, festival" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Original Price</label>
            <input
              type="number"
              name="originalPrice"
              [ngModel]="originalPrice()"
              (ngModelChange)="originalPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 2999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Price (With Discount) <span class="text-red-500">*</span></label>
            <input
              type="number"
              name="discountPrice"
              [ngModel]="discountPrice()"
              (ngModelChange)="discountPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1999"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Product Stock <span class="text-red-500">*</span></label>
          <input
            type="number"
            name="stock"
            [ngModel]="stock()"
            (ngModelChange)="stock.set($event)"
            [class]="inputClass"
            placeholder="e.g. 100"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Event Start Date <span class="text-red-500">*</span></label>
            <input
              type="date"
              name="startDate"
              [value]="startDateValue()"
              [min]="today"
              (change)="handleStartDateChange($event)"
              [class]="inputClass"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Event End Date <span class="text-red-500">*</span></label>
            <input
              type="date"
              name="endDate"
              [value]="endDateValue()"
              [min]="minEndDate()"
              (change)="handleEndDateChange($event)"
              [class]="inputClass"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Upload Images <span class="text-red-500">*</span></label>
          <input type="file" id="upload-event-img" class="hidden" multiple accept="image/*" (change)="handleImageChange($event)" />

          <div class="w-full flex items-center flex-wrap gap-2 mt-2">
            <label for="upload-event-img" class="cursor-pointer p-3 border-2 border-dashed border-gray-300 rounded hover:border-gray-400">
              <app-icon name="AiOutlinePlusCircle" [size]="30" color="#555" />
            </label>

            @for (img of images(); track $index) {
              <div class="relative">
                <img [src]="img" alt="Uploaded preview" class="h-[100px] w-[100px] object-cover rounded border" />
                <button
                  type="button"
                  (click)="removeImage($index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full h-[40px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-[4px] cursor-pointer transition-colors"
          >
            {{ isLoading() ? 'Creating...' : 'Create Event' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateEventComponent {
  private eventStore = inject(EventStore);
  private sellerStore = inject(SellerStore);
  private toast = inject(ToastService);
  private router = inject(Router);

  inputClass =
      'w-full mt-2 block px-3 h-[38px] border border-gray-300 rounded-[4px] text-sm focus:ring-blue-500 focus:border-blue-500';

  categoriesData = categoriesData;
  images = signal<string[]>([]);
  name = '';
  description = '';
  category = signal('');
  tags = '';
  originalPrice = signal<number | null>(null);
  discountPrice = signal<number | null>(null);
  stock = signal<number | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  isLoading = signal(false);

  today = new Date().toISOString().slice(0, 10);

  startDateValue = () => (this.startDate() ? this.startDate()!.toISOString().slice(0, 10) : '');
  endDateValue = () => (this.endDate() ? this.endDate()!.toISOString().slice(0, 10) : '');

  minEndDate = () =>
      this.startDate()
          ? new Date(this.startDate()!.getTime() + 3 * 86400000).toISOString().slice(0, 10)
          : this.today;

  constructor() {
    effect(() => {
      const error = this.eventStore.error();
      if (error) {
        this.toast.error(error);
        this.isLoading.set(false);
      }

      if (this.eventStore.success()) {
        this.toast.success('Event created successfully!');
        this.eventStore.success.set(undefined);
        this.isLoading.set(false);
        this.router.navigate(['/dashboard-events']);
      }
    });
  }

  handleStartDateChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val) {
      this.startDate.set(new Date(val));
      this.endDate.set(null);
    }
  }

  handleEndDateChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    if (val) {
      this.endDate.set(new Date(val));
    }
  }

  async handleImageChange(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const compressedBase64 = await resizeImageToBase64(file);
        this.images.update((prev) => [...prev, compressedBase64]);
      } catch (err) {
        this.toast.error('Failed to load image');
      }
    }
  }

  removeImage(index: number) {
    this.images.update((prev) => prev.filter((_, i) => i !== index));
  }

  async handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.name.trim()) {
      this.toast.error('Event product name is required.');
      return;
    }
    if (!this.category() || this.category() === 'Choose a category') {
      this.toast.error('Please choose a valid category.');
      return;
    }
    if (!this.discountPrice()) {
      this.toast.error('Discount price is required.');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.toast.error('Please select valid start and end dates.');
      return;
    }
    if (this.images().length === 0) {
      this.toast.error('Please upload at least one image.');
      return;
    }

    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }

    const sellerId = seller?._id || (seller?.id ? String(seller.id) : null);

    if (!sellerId) {
      this.toast.error('Seller session not found. Please log in again.');
      this.router.navigate(['/shop-login']);
      return;
    }

    try {
      this.isLoading.set(true);

      await this.eventStore.createEvent({
        name: this.name,
        description: this.description,
        category: this.category(),
        tags: this.tags,
        originalPrice: Number(this.originalPrice()) || 0,
        discountPrice: Number(this.discountPrice()) || 0,
        stock: Number(this.stock()) || 0,
        images: this.images(),
        shopId: sellerId,
        start_Date: this.startDate()?.toISOString(),
        Finish_Date: this.endDate()?.toISOString(),
      });

      this.toast.success('Event created successfully!');
      this.isLoading.set(false);

      this.name = '';
      this.description = '';
      this.category.set('');
      this.tags = '';
      this.images.set([]);
      this.originalPrice.set(null);
      this.discountPrice.set(null);
      this.stock.set(null);
      this.startDate.set(null);
      this.endDate.set(null);

      await this.router.navigate(['/dashboard-events']);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      this.isLoading.set(false);
      this.toast.error(err?.message || 'Failed to create event');
    }
  }
}