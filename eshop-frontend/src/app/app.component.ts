import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SellerStore, UserStore } from './core/state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private userStore = inject(UserStore);
  private sellerStore = inject(SellerStore);

  ngOnInit() {
    this.userStore.loadUser();
    this.sellerStore.loadSeller();
  }
}