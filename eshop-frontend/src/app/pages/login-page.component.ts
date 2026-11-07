import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { UserStore } from '../core/state';

@Component({ selector: 'app-login-page', standalone: true, imports: [LoginComponent], template: `<div><app-login /></div>` })
export class LoginPageComponent {
  private userStore = inject(UserStore); private router = inject(Router);
  constructor() { effect(() => { if (this.userStore.isAuthenticated() === true) this.router.navigate(['/']); }); }
}
