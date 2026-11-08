import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SellerStore } from '../../core/state';
import { server } from '../../config';

// Downscale avatar to max 400x400 to prevent 413 Payload Too Large
const resizeAvatar = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
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

@Component({
  selector: 'app-shop-settings',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="w-full min-h-screen flex flex-col items-center py-8">
      <div class="flex w-full 800px:w-[80%] flex-col justify-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        <!-- Avatar Section -->
        <div class="w-full flex items-center justify-center">
          <div class="relative">
            <div class="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-gray-100 shadow-sm flex items-center justify-center bg-gray-50">
              @if (avatar() || seller()?.avatar?.url) {
                <img [src]="avatar() || seller()?.avatar?.url" alt="Shop Avatar" class="w-full h-full object-cover" />
              } @else {
                <app-icon name="RxAvatar" [size]="140" color="#9ca3af" />
              }
            </div>

            <!-- Upload Camera Button -->
            <label
              for="shop-avatar-input"
              class="w-[36px] h-[36px] bg-[#E3E9EE] hover:bg-gray-300 rounded-full flex items-center justify-center cursor-pointer absolute bottom-[8px] right-[12px] shadow transition-colors"
              title="Change Avatar"
            >
              <input
                type="file"
                id="shop-avatar-input"
                class="hidden"
                accept="image/*"
                (change)="handleImage($event)"
              />
              <app-icon name="AiOutlineCamera" [size]="20" color="#333" />
            </label>
          </div>
        </div>

        @if (isUploadingAvatar()) {
          <p class="text-xs text-blue-600 text-center mt-2 font-medium">Uploading avatar...</p>
        }

        <!-- Form Section -->
        <form class="flex flex-col items-center mt-6 w-full" (ngSubmit)="updateHandler($event)">
          <div class="w-full 800px:w-[60%] space-y-4">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 pb-1">Shop Name</label>
              <input
                type="text"
                placeholder="Enter shop name"
                [(ngModel)]="name"
                name="name"
                class="{{ styles.input }} !w-full"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 pb-1">Shop Description</label>
              <textarea
                rows="3"
                placeholder="Enter your shop description"
                [(ngModel)]="description"
                name="description"
                class="w-full border border-gray-300 rounded-[4px] p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 pb-1">Shop Address</label>
              <input
                type="text"
                placeholder="Enter shop address"
                [(ngModel)]="address"
                name="address"
                class="{{ styles.input }} !w-full"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 pb-1">Shop Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  [(ngModel)]="phoneNumber"
                  name="phoneNumber"
                  class="{{ styles.input }} !w-full"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 pb-1">Shop Zip Code</label>
                <input
                  type="text"
                  placeholder="Enter zip code"
                  [(ngModel)]="zipCode"
                  name="zipCode"
                  class="{{ styles.input }} !w-full"
                  required
                />
              </div>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                [disabled]="isUpdating()"
                class="w-full h-[45px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[5px] transition-colors disabled:opacity-50 cursor-pointer text-sm"
              >
                {{ isUpdating() ? 'Updating...' : 'Update Shop Information' }}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class ShopSettingsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private sellerStore = inject(SellerStore);

  styles = styles;
  seller = this.sellerStore.seller;

  avatar = signal<string | null>(null);
  isUploadingAvatar = signal(false);
  isUpdating = signal(false);

  name = '';
  description = '';
  address = '';
  phoneNumber: string | number = '';
  zipCode: string | number = '';

  constructor() {
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller) {
        this.name = seller.name || '';
        this.description = seller.description || '';
        this.address = seller.address || '';
        this.phoneNumber = seller.phoneNumber || '';
        this.zipCode = seller.zipCode || '';
      }
    });
  }

  async handleImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      this.isUploadingAvatar.set(true);
      const base64Data = await resizeAvatar(file);
      this.avatar.set(base64Data);

      await this.api.put(`${server}/shop/update-shop-avatar`, { avatar: base64Data }, true);
      await this.sellerStore.loadSeller();
      this.toast.success('Avatar updated successfully!');
    } catch (error: any) {
      this.toast.error(this.api.message(error));
    } finally {
      this.isUploadingAvatar.set(false);
    }
  }

  async updateHandler(e: Event) {
    e.preventDefault();

    if (!this.name.trim() || !this.address.trim()) {
      this.toast.error('Name and address are required.');
      return;
    }

    try {
      this.isUpdating.set(true);
      await this.api.put(
          `${server}/shop/update-seller-info`,
          {
            name: this.name,
            address: this.address,
            zipCode: this.zipCode,
            phoneNumber: this.phoneNumber,
            description: this.description,
          },
          true
      );

      this.toast.success('Shop info updated successfully!');
      await this.sellerStore.loadSeller();
    } catch (error: any) {
      this.toast.error(this.api.message(error));
    } finally {
      this.isUpdating.set(false);
    }
  }
}