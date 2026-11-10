import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../../components/layout/headers';
import { DashboardSideBarComponent } from '../../components/layout/sidebars';
import { ShopAllProductsComponent } from '../../components/shop/catalogue-lists';

@Component({
    selector: 'app-shop-all-products-page',
    standalone: true,
    imports: [
        DashboardHeaderComponent,
        DashboardSideBarComponent,
        ShopAllProductsComponent,
    ],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <app-dashboard-header />

      <div class="flex items-start w-full flex-1">
        <!-- Sidebar Navigation -->
        <div class="w-[80px] 800px:w-[330px] shrink-0 sticky top-0">
          <app-dashboard-side-bar [active]="3" />
        </div>

        <!-- Main Content Area: expands across the rest of the viewport -->
        <main class="flex-1 min-w-0 p-4 800px:p-8">
          <app-shop-all-products class="w-full block" />
        </main>
      </div>
    </div>
  `,
})
export class ShopAllProductsPageComponent {}