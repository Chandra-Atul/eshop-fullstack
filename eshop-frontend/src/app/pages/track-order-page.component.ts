import { Component } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { TrackOrderComponent } from '../components/profile/track-order.component';

@Component({ selector: 'app-track-order-page', standalone: true, imports: [HeaderComponent, FooterComponent, TrackOrderComponent],
  template: `<div><app-header /><app-track-order /><app-footer /></div>` })
export class TrackOrderPageComponent {}
