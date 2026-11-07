import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { server } from '../config';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);
  readonly stripeApiKey = signal<string>('');
  async getStripeApiKey() {
    try { const data = await this.api.get(`${server}/payment/stripeapikey`); this.stripeApiKey.set(data.stripeApikey); return data.stripeApikey; }
    catch { return ''; }
  }
}
