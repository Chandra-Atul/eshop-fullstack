import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { brandingData, categoriesData } from '../../static/data';
import { styles } from '../../styles';

@Component({
  selector: 'app-categories',
  standalone: true,
  template: `<div class="{{ styles.section }} hidden sm:block">
    <div class="branding my-12 flex justify-between w-full shadow-sm bg-white p-5 rounded-md">
      @for (i of brandingData; track i.id) {
        <div class="flex items-start"><span [innerHTML]="i.iconSvg"></span>
          <div class="px-3"><h3 class="font-bold text-sm md:text-base">{{ i.title }}</h3><p class="text-xs md:text-sm">{{ i.Description }}</p></div>
        </div>
      }
    </div>
  </div>
  <div class="{{ styles.section }} bg-white p-6 rounded-lg mb-12" id="categories">
    <div class="grid grid-cols-1 gap-[5px] md:grid-cols-2 md:gap-[10px] lg:grid-cols-4 lg:gap-[20px] xl:grid-cols-5 xl:gap-[30px]">
      @for (i of categoriesData; track i.id) {
        <div class="w-full h-[100px] flex items-center justify-between cursor-pointer overflow-hidden" (click)="handleSubmit(i)">
          <h5 class="text-[18px] leading-[1.3]">{{ i.title }}</h5><img [src]="i.image_Url" class="w-[120px] object-cover" alt="" />
        </div>
      }
    </div>
  </div>`,
})
export class CategoriesComponent {
  brandingData = brandingData as any[];
  categoriesData = categoriesData;
  styles = styles;
  constructor(private router: Router) {}
  handleSubmit(i: any) { this.router.navigate(['/products'], { queryParams: { category: i.title } }); }
}
