import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { footerSupportLinks, footerProductLinks, footercompanyLinks } from '../../static/data';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, IconComponent],
  template: `
    <footer class="bg-[#0f172a] text-white overflow-hidden">
      
      <!-- Newsletter Banner -->
      <div class="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] border-y border-white/10 py-10 px-4 sm:px-8">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Special Offers & Perks
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Subscribe for exclusive member drops
            </h2>
            <p class="text-sm text-gray-300 mt-1">
              Get secret discounts, seasonal catalogs, and flash deal notifications.
            </p>
          </div>

          <form (submit)="handleSubscribe($event)" class="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div class="relative w-full sm:w-80">
              <input
                type="email"
                required
                [(ngModel)]="email"
                name="newsletterEmail"
                placeholder="Enter your email address..."
                class="w-full h-12 pl-4 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f63b60]/50 focus:border-[#f63b60] transition-all"
              />
              <span class="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none">
                <app-icon name="AiOutlineMail" [size]="18" />
              </span>
            </div>
            <button
              type="submit"
              class="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#f63b60] hover:bg-[#e02d51] text-white font-semibold text-sm transition-all shadow-md shadow-rose-900/20 active:scale-95 cursor-pointer shrink-0"
            >
              Join VIP Club
            </button>
          </form>
        </div>
      </div>

      <!-- Main Navigation Links Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          <!-- Column 1: Brand Info & Social Media (Span 2 on LG) -->
          <div class="lg:col-span-2 space-y-4">
            <a routerLink="/" class="flex items-center gap-2.5 select-none group w-fit">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-md">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span class="text-2xl font-black tracking-tight text-white leading-none">
                Shop<span class="text-[#f63b60]">O</span>
              </span>
            </a>

            <p class="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your modern destination for curated essentials, artisan lifestyle accents, and verified marketplace sellers with guaranteed fast dispatch.
            </p>

            <!-- Social Media Icons -->
            <div class="flex items-center gap-3 pt-2">
              <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                <app-icon name="AiFillFacebook" [size]="18" />
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                <app-icon name="AiOutlineTwitter" [size]="18" />
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                <app-icon name="AiFillInstagram" [size]="18" />
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors">
                <app-icon name="AiFillYoutube" [size]="18" />
              </a>
            </div>
          </div>

          <!-- Column 2: Company -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Company</h3>
            <ul class="space-y-2.5">
              @for (link of footerProductLinks; track $index) {
                <li>
                  <a [routerLink]="link.link || '/'" class="text-gray-400 hover:text-white text-sm transition-colors">
                    {{ link.name }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Column 3: Shop -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Shop & Explore</h3>
            <ul class="space-y-2.5">
              @for (link of footercompanyLinks; track $index) {
                <li>
                  <a [routerLink]="link.link || '/'" class="text-gray-400 hover:text-white text-sm transition-colors">
                    {{ link.name }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Column 4: Support -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Help & Support</h3>
            <ul class="space-y-2.5">
              @for (link of footerSupportLinks; track $index) {
                <li>
                  <a [routerLink]="link.link || '/'" class="text-gray-400 hover:text-white text-sm transition-colors">
                    {{ link.name }}
                  </a>
                </li>
              }
            </ul>
          </div>

        </div>
      </div>

      <!-- Bottom Bar (Copyright & Payments) -->
      <div class="border-t border-white/10 py-6 px-4 sm:px-8 bg-black/30">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>© 2026 ShopO Inc. All rights reserved.</span>

          <div class="flex items-center gap-6">
            <a routerLink="/" class="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a routerLink="/" class="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a routerLink="/" class="hover:text-white transition-colors">Security</a>
          </div>

          <!-- Payment Security Banner -->
          <div class="flex items-center gap-2">
            <img
              src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
              alt="Supported Payment Gateways"
              class="h-6 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

    </footer>
  `,
})
export class FooterComponent {
  private toast = inject(ToastService);

  footerProductLinks = footerProductLinks as any[];
  footercompanyLinks = footercompanyLinks as any[];
  footerSupportLinks = footerSupportLinks as any[];

  email = '';

  handleSubscribe(e: Event) {
    e.preventDefault();
    if (!this.email || !this.email.includes('@')) {
      this.toast.error('Please enter a valid email address');
      return;
    }
    this.toast.success('Thank you for subscribing to our newsletter!');
    this.email = '';
  }
}