import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { server } from '../config';

@Component({
  selector: 'app-seller-activation-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="w-full h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
        @if (loading()) {
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600 font-medium text-base">Activating your seller account...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold mb-3">
              ✕
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Activation Failed</h3>
            <p class="mt-2 text-gray-600 text-sm">Your activation token is invalid or has expired.</p>
            <a
              routerLink="/shop-create"
              class="mt-6 inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
            >
              Register Again
            </a>
          </div>
        } @else {
          <div class="flex flex-col items-center">
            <div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl font-bold mb-3">
              ✓
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Account Activated</h3>
            <p class="mt-2 text-gray-600 text-sm">Your seller account has been created successfully!</p>
            <a
              routerLink="/shop-login"
              class="mt-6 inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
            >
              Proceed to Shop Login
            </a>
          </div>
        }
      </div>
    </div>
  `,
})
export class SellerActivationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  loading = signal(true);
  error = signal(false);

  async ngOnInit() {
    const activation_token = this.route.snapshot.paramMap.get('activation_token');

    if (!activation_token) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    try {
      await this.api.post(`${server}/shop/activation`, { activation_token });
      this.error.set(false);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}