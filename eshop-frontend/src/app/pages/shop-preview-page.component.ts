import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { styles } from '../styles';
import { ShopInfoComponent, ShopProfileDataComponent } from '../components/shop/shop-data';
import { SellerStore } from '../core/state';

@Component({
  selector: 'app-shop-preview-page',
  standalone: true,
  imports: [ShopInfoComponent, ShopProfileDataComponent],
  template: `
    <div class="{{ styles.section }} bg-[#f5f5f5] min-h-screen py-10">
      <div class="w-full 800px:flex justify-between items-start gap-6">
        <!-- Shop Sidebar Info -->
        <div class="w-full 800px:w-[28%] bg-white rounded-[6px] shadow-sm 800px:overflow-y-auto 800px:max-h-[90vh] 800px:sticky top-10 left-0 z-10 border border-gray-100">
          <app-shop-info [isOwner]="isOwner()" />
        </div>

        <!-- Shop Products / Events / Reviews -->
        <div class="w-full 800px:w-[70%] mt-6 800px:mt-0 bg-white rounded-[6px] shadow-sm border border-gray-100 p-4">
          <app-shop-profile-data [isOwner]="isOwner()" />
        </div>
      </div>
    </div>
  `,
})
export class ShopPreviewPageComponent {
  private route = inject(ActivatedRoute);
  private sellerStore = inject(SellerStore);

  styles = styles;

  // Dynamically verify if the visitor is the store owner
  isOwner = computed(() => {
    const shopId = this.route.snapshot.paramMap.get('id');
    const currentSeller = this.sellerStore.seller();
    return !!(currentSeller?._id && shopId && currentSeller._id === shopId);
  });
}