import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { ToastService } from '../../core/toast.service';
import { EventStore, ProductStore, SellerStore } from '../../core/state';
import { categoriesData } from '../../static/data';

// Helper to downscale large image files to prevent HTTP 413 Payload Too Large
const resizeImageToBase64 = (file: File, maxWidth = 900, maxHeight = 900): Promise<string> => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const inputClass =
    'w-full mt-1.5 block px-3.5 h-11 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 rounded-xl text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400';

// ==========================================
// 1. CREATE PRODUCT COMPONENT
// ==========================================
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [FormsModule, IconComponent],
  host: {
    class: 'w-full flex justify-center py-6',
  },
  template: `
    <div class="w-full max-w-3xl bg-white shadow-xl shadow-gray-100/70 rounded-3xl p-6 sm:p-10 border border-gray-100">
      
      <div class="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-[#4f46e5]">Inventory Management</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Create New Product</h2>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
          📦
        </div>
      </div>

      <form (ngSubmit)="handleSubmit($event)" class="mt-8 space-y-6">
        
        <!-- Product Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Product Title <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            [class]="inputClass"
            placeholder="e.g. Ergonomic Mechanical Wireless Keyboard"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Detailed Description <span class="text-rose-500">*</span>
          </label>
          <textarea
            rows="4"
            name="description"
            [(ngModel)]="description"
            class="w-full mt-1.5 block p-3.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 rounded-xl text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 resize-y"
            placeholder="Highlight materials, features, key technical specifications, and warranty details..."
            required
          ></textarea>
        </div>

        <!-- Category & Tags Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Department Category <span class="text-rose-500">*</span>
            </label>
            <select
              [class]="inputClass"
              [value]="category()"
              (change)="category.set($any($event.target).value)"
              required
            >
              <option value="">Select a category</option>
              @for (cat of categoriesData; track cat.title) {
                <option [value]="cat.title">{{ cat.title }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Search Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              [(ngModel)]="tags"
              [class]="inputClass"
              placeholder="e.g. wireless, bluetooth, rgb"
            />
          </div>
        </div>

        <!-- Pricing: Original Price & Discount Price -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-gray-50/70 rounded-2xl border border-gray-100">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Original MRP (₹)
            </label>
            <input
              type="number"
              name="originalPrice"
              [ngModel]="originalPrice()"
              (ngModelChange)="originalPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 2499"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Selling Price with Discount (₹) <span class="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="discountPrice"
              [ngModel]="discountPrice()"
              (ngModelChange)="discountPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1899"
              required
            />
          </div>

          <!-- Live Margin & Savings Preview -->
          @if (computedDiscountPercentage() > 0) {
            <div class="sm:col-span-2 flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span>Customer Savings: ₹{{ (originalPrice()! - discountPrice()!).toFixed(2) }}</span>
              <span class="px-2 py-0.5 bg-emerald-600 text-white rounded-md font-bold">
                {{ computedDiscountPercentage() }}% OFF Badge Active
              </span>
            </div>
          }
        </div>

        <!-- Inventory Stock -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Available Inventory Units <span class="text-rose-500">*</span>
          </label>
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

        <!-- Multi-Image Upload Area -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Product Photos <span class="text-rose-500">*</span>
          </label>
          
          <input
            type="file"
            id="upload-product-img"
            class="hidden"
            multiple
            accept="image/*"
            (change)="handleImageChange($event)"
          />

          <div class="flex items-center flex-wrap gap-3">
            <label
              for="upload-product-img"
              class="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-[#4f46e5] rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-gray-50/50 hover:bg-indigo-50/20 transition-all group"
            >
              <app-icon name="AiOutlinePlusCircle" [size]="24" class="text-gray-400 group-hover:text-[#4f46e5]" />
              <span class="text-[11px] font-bold text-gray-500 group-hover:text-[#4f46e5]">Add Image</span>
            </label>

            @for (img of images(); track $index) {
              <div class="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 group shadow-2xs">
                <img [src]="img" alt="Preview" class="w-full h-full object-contain p-1 bg-white" />
                <button
                  type="button"
                  (click)="removeImage($index)"
                  class="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full h-12 bg-[#4f46e5] hover:bg-[#4338ca] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10 transition-all cursor-pointer"
          >
            @if (isLoading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Publishing Product...</span>
            } @else {
              <span>Publish Product to Store</span>
            }
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

  inputClass = inputClass;
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

  computedDiscountPercentage = () => {
    const orig = Number(this.originalPrice());
    const disc = Number(this.discountPrice());
    if (orig && disc && orig > disc) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return 0;
  };

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
      this.toast.error('Product title is required');
      return;
    }
    if (!this.category()) {
      this.toast.error('Please choose a category');
      return;
    }
    if (!this.discountPrice()) {
      this.toast.error('Selling discount price is required');
      return;
    }
    if (this.images().length === 0) {
      this.toast.error('Please upload at least one product photo');
      return;
    }

    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }

    const sellerId = seller?._id || (seller?.id ? String(seller.id) : null);
    if (!sellerId) {
      this.toast.error('Seller session expired. Please log in again.');
      this.router.navigate(['/shop-login']);
      return;
    }

    try {
      this.isLoading.set(true);

      const parsedOrigPrice = this.originalPrice() ? Number(this.originalPrice()) : null;

      await this.productStore.createProduct(
          this.name,
          this.description,
          this.category(),
          this.tags,
          parsedOrigPrice as any,
          Number(this.discountPrice()),
          Number(this.stock()) || 0,
          sellerId,
          this.images()
      );

      this.toast.success('Product created successfully!');
      this.isLoading.set(false);
      this.router.navigate(['/dashboard-products']);
    } catch (err: any) {
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
    class: 'w-full flex justify-center py-6',
  },
  template: `
    <div class="w-full max-w-3xl bg-white shadow-xl shadow-gray-100/70 rounded-3xl p-6 sm:p-10 border border-gray-100">
      
      <div class="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-rose-500">Flash Sales & Campaigns</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Create Promotional Event</h2>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
          ⚡
        </div>
      </div>

      <form (ngSubmit)="handleSubmit($event)" class="mt-8 space-y-6">
        
        <!-- Event Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Event Item Name <span class="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            [class]="inputClass"
            placeholder="e.g. Fire-Boltt Hurricane 2026 1.3 Curved Glass Display"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Event Description <span class="text-rose-500">*</span>
          </label>
          <textarea
            rows="4"
            name="description"
            [(ngModel)]="description"
            class="w-full mt-1.5 block p-3.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 rounded-xl text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 resize-y"
            placeholder="Describe the limited-time discount, warranty, and special inclusions..."
            required
          ></textarea>
        </div>

        <!-- Category & Tags -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Category <span class="text-rose-500">*</span>
            </label>
            <select
              [class]="inputClass"
              [value]="category()"
              (change)="category.set($any($event.target).value)"
              required
            >
              <option value="">Select a category</option>
              @for (cat of categoriesData; track cat.title) {
                <option [value]="cat.title">{{ cat.title }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Campaign Tags
            </label>
            <input
              type="text"
              name="tags"
              [(ngModel)]="tags"
              [class]="inputClass"
              placeholder="e.g. flash-sale, smartwatch, festive"
            />
          </div>
        </div>

        <!-- Pricing: Original vs Deal Price -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-rose-50/40 rounded-2xl border border-rose-100">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Original MRP (₹) <span class="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="originalPrice"
              [ngModel]="originalPrice()"
              (ngModelChange)="originalPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1999"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Special Event Deal Price (₹) <span class="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="discountPrice"
              [ngModel]="discountPrice()"
              (ngModelChange)="discountPrice.set($event)"
              [class]="inputClass"
              placeholder="e.g. 1199"
              required
            />
          </div>

          <!-- Live Percentage Badge Calculation -->
          @if (computedDiscountPercentage() > 0) {
            <div class="sm:col-span-2 flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span>Customer saves ₹{{ (originalPrice()! - discountPrice()!).toFixed(2) }} instantly</span>
              <span class="px-2.5 py-0.5 bg-emerald-600 text-white rounded-md font-bold">
                -{{ computedDiscountPercentage() }}% OFF Badge
              </span>
            </div>
          }
        </div>

        <!-- Stock and Dates -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Event Stock Allocation <span class="text-rose-500">*</span>
          </label>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Event Start Date <span class="text-rose-500">*</span>
            </label>
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
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Event End Date <span class="text-rose-500">*</span>
            </label>
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

        <!-- Image Upload -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Event Banner Photos <span class="text-rose-500">*</span>
          </label>
          <input
            type="file"
            id="upload-event-img"
            class="hidden"
            multiple
            accept="image/*"
            (change)="handleImageChange($event)"
          />

          <div class="flex items-center flex-wrap gap-3">
            <label
              for="upload-event-img"
              class="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-rose-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-gray-50/50 hover:bg-rose-50/20 transition-all group"
            >
              <app-icon name="AiOutlinePlusCircle" [size]="24" class="text-gray-400 group-hover:text-rose-500" />
              <span class="text-[11px] font-bold text-gray-500 group-hover:text-rose-500">Add Image</span>
            </label>

            @for (img of images(); track $index) {
              <div class="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 group shadow-2xs">
                <img [src]="img" alt="Preview" class="w-full h-full object-contain p-1 bg-white" />
                <button
                  type="button"
                  (click)="removeImage($index)"
                  class="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full h-12 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition-all cursor-pointer"
          >
            @if (isLoading()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Launching Event...</span>
            } @else {
              <span>Publish Limited-Time Event</span>
            }
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

  inputClass = inputClass;
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
          ? new Date(this.startDate()!.getTime() + 86400000).toISOString().slice(0, 10)
          : this.today;

  computedDiscountPercentage = () => {
    const orig = Number(this.originalPrice());
    const disc = Number(this.discountPrice());
    if (orig && disc && orig > disc) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return 0;
  };

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
      this.toast.error('Event title is required');
      return;
    }
    if (!this.category()) {
      this.toast.error('Please choose a category');
      return;
    }
    if (!this.discountPrice()) {
      this.toast.error('Event deal price is required');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.toast.error('Please select both start and end dates');
      return;
    }
    if (this.images().length === 0) {
      this.toast.error('Please upload at least one event banner');
      return;
    }

    let seller: any = this.sellerStore.seller();
    if (!seller?._id && !seller?.id) {
      await this.sellerStore.loadSeller();
      seller = this.sellerStore.seller();
    }

    const sellerId = seller?._id || (seller?.id ? String(seller.id) : null);
    if (!sellerId) {
      this.toast.error('Seller session expired. Please log in again.');
      this.router.navigate(['/shop-login']);
      return;
    }

    try {
      this.isLoading.set(true);

      const parsedOrigPrice = this.originalPrice()
          ? Number(this.originalPrice())
          : Number(this.discountPrice()) * 1.35;

      // Note: sending both originalPrice and original_price so any backend getter catches it
      await this.eventStore.createEvent({
        name: this.name,
        description: this.description,
        category: this.category(),
        tags: this.tags,
        originalPrice: parsedOrigPrice,
        original_price: parsedOrigPrice,
        discountPrice: Number(this.discountPrice()),
        discount_price: Number(this.discountPrice()),
        stock: Number(this.stock()) || 0,
        images: this.images(),
        shopId: sellerId,
        start_Date: this.startDate()?.toISOString(),
        finish_Date: this.endDate()?.toISOString(),
      });

      this.toast.success('Event launched successfully!');
      this.isLoading.set(false);
      this.router.navigate(['/dashboard-events']);
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.error(err?.message || 'Failed to create event');
    }
  }
}