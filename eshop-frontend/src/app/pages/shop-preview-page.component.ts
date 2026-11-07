import { Component } from '@angular/core';
import { styles } from '../styles';
import { ShopInfoComponent } from '../components/shop/shop-data';
import { ShopProfileDataComponent } from '../components/shop/shop-data';

@Component({ selector: 'app-shop-preview-page', standalone: true, imports: [ShopInfoComponent, ShopProfileDataComponent],
  template: `<div class="{{ styles.section }} bg-[#f5f5f5]"><div class="w-full 800px:flex py-10 justify-between">
    <div class="800px:w-[25%] bg-[#fff] rounded-[4px] shadow-sm 800px:overflow-y-scroll 800px:h-[90vh] 800px:sticky top-10 left-0 z-10"><app-shop-info [isOwner]="false" /></div>
    <div class="800px:w-[72%] mt-5 800px:mt-0 rounded-[4px]"><app-shop-profile-data [isOwner]="false" /></div></div></div>` })
export class ShopPreviewPageComponent { styles = styles; }
