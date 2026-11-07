import { Component } from '@angular/core';
import { ShopInfoComponent } from '../../components/shop/shop-data';
import { ShopProfileDataComponent } from '../../components/shop/shop-data';
import { styles } from '../../styles';

@Component({ selector: 'app-shop-home-page', standalone: true, imports: [ShopInfoComponent, ShopProfileDataComponent], template: `<div class="{{ styles.section }} bg-[#f5f5f5]"><div class="w-full flex py-10 justify-between"><div class="w-[25%] bg-[#fff] rounded-[4px] shadow-sm overflow-y-scroll h-[90vh] sticky top-10 left-0 z-10"><app-shop-info [isOwner]="true" /></div><div class="w-[72%] rounded-[4px]"><app-shop-profile-data [isOwner]="true" /></div></div></div>` })
export class ShopHomePageComponent {  styles = styles;}
