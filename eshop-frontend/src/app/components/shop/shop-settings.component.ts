import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { SellerStore } from '../../core/state';
import { server } from '../../config';

@Component({
  selector: 'app-shop-settings',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-full min-h-screen flex flex-col items-center"><div class="flex w-full 800px:w-[80%] flex-col justify-center my-5">
    <div class="w-full flex items-center justify-center"><div class="relative">
      <img [src]="avatar() ? avatar()! : seller()?.avatar?.url" alt="" class="w-[200px] h-[200px] rounded-full cursor-pointer" />
      <div class="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
        <input type="file" id="image" class="hidden" (change)="handleImage($event)" /><label for="image"><app-icon name="AiOutlineCamera" /></label></div>
    </div></div>
    <form class="flex flex-col items-center" (ngSubmit)="updateHandler($event)">
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><div class="w-full pl-[3%]"><label class="block pb-2">Shop Name</label></div>
        <input type="text" [placeholder]="seller()?.name || ''" [(ngModel)]="name" name="name" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required /></div>
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><div class="w-full pl-[3%]"><label class="block pb-2">Shop description</label></div>
        <input type="text" [placeholder]="seller()?.description ? seller()!.description! : 'Enter your shop description'" [ngModel]="description()" (ngModelChange)="description.set($event)" name="description" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" /></div>
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><div class="w-full pl-[3%]"><label class="block pb-2">Shop Address</label></div>
        <input type="text" [placeholder]="seller()?.address || ''" [ngModel]="address()" (ngModelChange)="address.set($event)" name="address" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required /></div>
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><div class="w-full pl-[3%]"><label class="block pb-2">Shop Phone Number</label></div>
        <input type="number" [placeholder]="$any(seller()?.phoneNumber) || ''" [ngModel]="phoneNumber()" (ngModelChange)="phoneNumber.set($event)" name="phoneNumber" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required /></div>
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><div class="w-full pl-[3%]"><label class="block pb-2">Shop Zip Code</label></div>
        <input type="number" [placeholder]="$any(seller()?.zipCode) || ''" [ngModel]="zipCode()" (ngModelChange)="zipCode.set($event)" name="zipCode" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required /></div>
      <div class="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5"><input type="submit" value="Update Shop" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required /></div>
    </form>
  </div></div>`,
})
export class ShopSettingsComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private sellerStore = inject(SellerStore);
  styles = styles;
  seller = this.sellerStore.seller;
  avatar = signal<string | null>(null);
  name = '';
  description = signal(''); address = signal(''); phoneNumber = signal<any>(''); zipCode = signal<any>('');
  constructor() {
    effect(() => {
      const seller = this.sellerStore.seller();
      if (seller) {
        this.name = seller.name;
        if (!this.description()) this.description.set(seller.description || '');
        if (!this.address()) this.address.set(seller.address || '');
        if (!this.phoneNumber()) this.phoneNumber.set(seller.phoneNumber);
        if (!this.zipCode()) this.zipCode.set(seller.zipCode);
      }
    });
  }
  async handleImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        this.avatar.set(reader.result as string);
        try { await this.api.put(`${server}/shop/update-shop-avatar`, { avatar: reader.result }, true); this.sellerStore.loadSeller(); this.toast.success('Avatar updated successfully!'); }
        catch (error) { this.toast.error(this.api.message(error)); }
      }
    };
    reader.readAsDataURL(file);
  }
  async updateHandler(e: Event) {
    e.preventDefault();
    try {
      await this.api.put(`${server}/shop/update-seller-info`, { name: this.name, address: this.address(), zipCode: this.zipCode(), phoneNumber: this.phoneNumber(), description: this.description() }, true);
      this.toast.success('Shop info updated succesfully!');
      this.sellerStore.loadSeller();
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}
