import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SignupComponent } from '../components/signup/signup.component';
import { UserStore } from '../core/state';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [SignupComponent],
  template: `<div><app-signup /></div>`,
})
export class SignupPageComponent {
  private userStore = inject(UserStore);
  private router = inject(Router);
  constructor() {
    effect(() => {
      if (this.userStore.isAuthenticated() === true) this.router.navigate(['/']);
    });
  }
}