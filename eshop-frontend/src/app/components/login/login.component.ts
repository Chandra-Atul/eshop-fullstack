import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';
import { styles } from '../../styles';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md"><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Login to your account</h2></div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"><div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" (ngSubmit)="handleSubmit($event)">
        <div><label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <div class="mt-1"><input type="email" name="email" autocomplete="email" required [(ngModel)]="email"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" /></div></div>
        <div><label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1 relative">
            <input [type]="visible() ? 'text' : 'password'" name="password" autocomplete="current-password" required [(ngModel)]="password"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            @if (visible()) { <app-icon name="AiOutlineEye" [size]="25" class="absolute right-2 top-2 cursor-pointer" (click)="visible.set(false)" /> }
            @else { <app-icon name="AiOutlineEyeInvisible" [size]="25" class="absolute right-2 top-2 cursor-pointer" (click)="visible.set(true)" /> }
          </div></div>
        <div class="{{ styles.noramlFlex }} justify-between">
          <div class="{{ styles.noramlFlex }}">
            <input type="checkbox" name="remember-me" id="remember-me" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label></div>
          <div class="text-sm"><a href=".forgot-password" class="font-medium text-blue-600 hover:text-blue-500">Forgot your password?</a></div>
        </div>
        <div><button type="submit" class="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Submit</button></div>
        <div class="{{ styles.noramlFlex }} w-full"><h4>Not have any account?</h4><a routerLink="/sign-up" class="text-blue-600 pl-2">Sign Up</a></div>
      </form>
    </div></div>
  </div>`,
})
export class LoginComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  styles = styles;
  email = '';
  password = '';
  visible = signal(false);
  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      await this.api.post(`${server}/user/login-user`, { email: this.email, password: this.password }, true);
      this.toast.success('Login Success!');
      await this.router.navigate(['/']);
      window.location.reload();
    } catch (err) { this.toast.error(this.api.message(err)); }
  }
}
