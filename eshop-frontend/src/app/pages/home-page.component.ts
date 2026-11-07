import { Component } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { HeroComponent } from '../components/route/hero.component';
import { CategoriesComponent } from '../components/route/categories.component';
import { BestDealsComponent } from '../components/route/best-deals.component';
import { FeaturedProductComponent } from '../components/route/featured-product.component';
import { EventsComponent } from '../components/events/events.component';
import { SponsoredComponent } from '../components/route/sponsored.component';
import { FooterComponent } from '../components/layout/footer.component';

@Component({ selector: 'app-home-page', standalone: true, imports: [HeaderComponent, HeroComponent, CategoriesComponent, BestDealsComponent, FeaturedProductComponent, EventsComponent, SponsoredComponent, FooterComponent], template: `<div><app-header [activeHeading]="1" /><app-hero /><app-categories /><app-best-deals /><app-events /><app-featured-product /><app-sponsored /><app-footer /></div>` })
export class HomePageComponent {}
