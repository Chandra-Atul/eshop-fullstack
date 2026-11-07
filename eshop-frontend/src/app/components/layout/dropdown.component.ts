import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { styles } from '../../styles';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  template: `<div class="pb-4 w-[270px] bg-[#fff] absolute z-30 rounded-b-md shadow-sm">
    @for (i of categoriesData; track i.id) {
      <div class="{{ styles.noramlFlex }}" (click)="submitHandle(i)">
        <img [src]="i.image_Url" style="width:25px;height:25px;object-fit:contain;margin-left:10px;user-select:none" alt="" />
        <h3 class="m-3 cursor-pointer select-none">{{ i.title }}</h3>
      </div>
    }
  </div>`,
})
export class DropdownComponent {
  @Input() categoriesData: any[] = [];
  @Output() dropDownChange = new EventEmitter<boolean>();
  styles = styles;
  constructor(private router: Router) {}
  submitHandle(i: any) {
    this.router.navigate(['/products'], { queryParams: { category: i.title } });
    this.dropDownChange.emit(false);
    window.location.reload();
  }
}
