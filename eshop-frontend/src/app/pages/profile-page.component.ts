import { Component, computed, inject, signal } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { LoaderComponent } from '../components/layout/loader.component';
import { ProfileSidebarComponent } from '../components/profile/profile-sidebar.component';
import { ProfileContentComponent } from '../components/profile/profile-content.component';
import { styles } from '../styles';
import { UserStore } from '../core/state';

@Component({ selector: 'app-profile-page', standalone: true, imports: [HeaderComponent, LoaderComponent, ProfileSidebarComponent, ProfileContentComponent],
  template: `<div>@if (loading()) { <app-loader /> } @else { <app-header />
    <div class="{{ styles.section }} flex bg-[#f5f5f5] py-10">
      <div class="w-[50px] 800px:w-[335px] sticky 800px:mt-0 mt-[18%]"><app-profile-sidebar [active]="active()" (activeChange)="active.set($event)" /></div>
      <app-profile-content [active]="active()" /></div> }</div>` })
export class ProfilePageComponent {
  private userStore = inject(UserStore);
  styles = styles; active = signal(1);
  loading = computed(() => this.userStore.loading());
}
