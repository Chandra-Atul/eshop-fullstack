import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { styles } from '../../styles';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  template: `
    <div class="pb-4 w-[270px] bg-white absolute top-[60px] left-0 z-30 rounded-b-md shadow-md border border-gray-100 max-h-[400px] overflow-y-auto">
      @if (categoriesData && categoriesData.length > 0) {
        @for (i of categoriesData; track (i.id || i._id || i.title || $index)) {
          <div 
            class="{{ styles.noramlFlex }} hover:bg-gray-100 cursor-pointer transition-colors px-2 py-1"
            (click)="submitHandle(i)"
          >
            <img 
              [src]="i.image_Url || i.imageUrl || i.image || 'https://via.placeholder.com/25'" 
              class="w-[25px] h-[25px] object-contain ml-[10px] select-none" 
              [alt]="i.title || 'Category'" 
            />
            <h3 class="m-3 text-sm font-medium text-gray-800 select-none">
              {{ i.title || i.name }}
            </h3>
          </div>
        }
      } @else {
        <div class="p-4 text-center text-sm text-gray-400">
          No categories found
        </div>
      }
    </div>
  `,
})
export class DropdownComponent {
  @Input() categoriesData: any[] = [];
  @Output() dropDownChange = new EventEmitter<boolean>();
  styles = styles;

  constructor(private router: Router) {}

  submitHandle(i: any) {
    const categoryTitle = i.title || i.name;
    this.router.navigate(['/products'], { queryParams: { category: categoryTitle } });
    this.dropDownChange.emit(false);
    // Removed window.location.reload() so SPA auth state and signals are not wiped
  }
}