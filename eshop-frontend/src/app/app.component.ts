import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SellerStore, UserStore } from './core/state';
import {ToastComponent} from "./core/toast-container.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet></router-outlet><app-toast></app-toast>`,
})
export class AppComponent implements OnInit {
  private userStore = inject(UserStore);
  private sellerStore = inject(SellerStore);

  ngOnInit() {
    this.userStore.loadUser();
    this.sellerStore.loadSeller();
  }
}