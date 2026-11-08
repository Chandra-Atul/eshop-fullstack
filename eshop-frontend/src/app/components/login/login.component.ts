import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { UserStore } from '../../core/state';
import { server } from '../../config';
import { styles } from '../../styles';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to your account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" (ngSubmit)="handleSubmit($event)">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input
                  type="email"
                  name="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="email"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1 relative">
                <input
                  [type]="visible() ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  required
                  [(ngModel)]="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                @if (visible()) {
                  <app-icon name="AiOutlineEye" [size]="25" class="absolute right-2 top-2 cursor-pointer" (click)="visible.set(false)" />
                } @else {
                  <app-icon name="AiOutlineEyeInvisible" [size]="25" class="absolute right-2 top-2 cursor-pointer" (click)="visible.set(true)" />
                }
              </div>
            </div>

            <div class="{{ styles.noramlFlex }} justify-between">
              <div class="{{ styles.noramlFlex }}">
                <input
                  type="checkbox"
                  name="remember-me"
                  id="remember-me"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              <div class="text-sm">
                <a routerLink="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isLoading()"
                class="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isLoading() ? 'Logging in...' : 'Submit' }}
              </button>
            </div>

            <div class="{{ styles.noramlFlex }} w-full">
              <h4>Not have any account?</h4>
              <a routerLink="/sign-up" class="text-blue-600 pl-2">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private api = inject(ApiService);
  private userStore = inject(UserStore);
  private toast = inject(ToastService);
  private router = inject(Router);

  styles = styles;
  email = '';
  password = '';
  visible = signal(false);
  isLoading = signal(false);

  async handleSubmit(e: Event) {
    e.preventDefault();
    if (!this.email || !this.password) {
      this.toast.error('Please enter both email and password');
      return;
    }

    try {
      this.isLoading.set(true);
      const res: any = await this.api.post(
          `${server}/user/login-user`,
          { email: this.email, password: this.password },
          true
      );

      // Save token if returned in JSON payload
      if (res?.token) {
        localStorage.setItem('token', res.token);
      }

      // If backend returned the user object directly, populate UserStore immediately
      if (res?.user) {
        this.userStore.user.set(res.user);
        this.userStore.isAuthenticated.set(true);
      } else {
        // Otherwise fetch fresh profile from /user/getuser
        await this.userStore.loadUser();
      }

      this.toast.success('Login Success!');
      this.isLoading.set(false);

      // Navigate cleanly without page reload
      await this.router.navigate(['/']);
    } catch (err: any) {
      this.isLoading.set(false);
      this.toast.error(this.api.message(err));
    }
  }
}