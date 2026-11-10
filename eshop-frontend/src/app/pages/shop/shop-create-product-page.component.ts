import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { CreateProductComponent } from '../../components/shop/forms';

@Component({
    selector: 'app-shop-create-product-page',
    standalone: true,
    imports: [
        DashboardHeaderComponent,
        DashboardSideBarComponent,
        CreateProductComponent,
    ],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <app-dashboard-header />

      <div class="flex items-start w-full flex-1">
        <!-- Sidebar Column -->
        <div class="w-[80px] 800px:w-[330px] shrink-0 sticky top-0">
          <app-dashboard-side-bar [active]="4" />
        </div>

        <!-- Form Content Column -->
        <div class="flex-1 flex justify-center py-6 px-4">
          <!-- Added w-full flex justify-center to the host element -->
          <app-create-product class="w-full flex justify-center" />
        </div>
      </div>
    </div>
  `,
})
export class ShopCreateProductPageComponent {}