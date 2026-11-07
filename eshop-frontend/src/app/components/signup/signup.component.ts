import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';
import { styles } from '../../styles';
import { imageFileResizer } from '../../shared/image-resizer';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `<div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md"><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Register as a new user</h2></div>
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md"><div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form class="space-y-6" (ngSubmit)="handleSubmit($event)">
        <div><label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
          <div class="mt-1"><input type="text" name="name" autocomplete="name" required [(ngModel)]="name"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" /></div></div>
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
        <div><label for="avatar" class="block text-sm font-medium text-gray-700"></label>
          <div class="mt-2 flex items-center">
            <span class="inline-block h-8 w-8 rounded-full overflow-hidden">
              @if (avatar()) { <img [src]="avatar()!" alt="avatar" class="h-full w-full object-cover rounded-full" /> }
              @else { <app-icon name="RxAvatar" class="h-8 w-8" [size]="32" /> }
            </span>
            <label for="file-input" class="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span>Upload a file</span>
              <input type="file" name="avatar" id="file-input" accept=".jpg,.jpeg,.png" (change)="handleFileInputChange($event)" class="sr-only" />
            </label>
          </div></div>
        <div><button type="submit" class="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Submit</button></div>
        <div class="{{ styles.noramlFlex }} w-full"><h4>Already have an account?</h4><a routerLink="/login" class="text-blue-600 pl-2">Sign In</a></div>
      </form>
    </div></div>
  </div>`,
})
export class SignupComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  styles = styles;
  name = '';
  email = '';
  password = '';
  visible = signal(false);
  avatar = signal<string | null>(null);
  async handleFileInputChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { this.avatar.set(await imageFileResizer(file, 150, 150, 100)); }
  }
  async handleSubmit(e: Event) {
    e.preventDefault();
    try {
      const res: any = await this.api.post(`${server}/user/create-user`, { name: this.name, email: this.email, password: this.password, avatar: this.avatar() });
      this.toast.success(res.message);
      this.name = ''; this.email = ''; this.password = ''; this.avatar.set(null);
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}
