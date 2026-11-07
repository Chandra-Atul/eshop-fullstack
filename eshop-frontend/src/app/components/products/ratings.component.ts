import { Component, Input } from '@angular/core';
import { IconComponent } from '../../core/icon.component';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [IconComponent],
  template: `<div class="flex">
    @for (star of stars; track $index) {
      @if (star === 'fill') { <app-icon name="AiFillStar" [size]="20" color="#f6b100" class="mr-2 cursor-pointer" /> }
      @else if (star === 'half') { <app-icon name="BsStarHalf" [size]="17" color="#f6ba00" class="mr-2 cursor-pointer" /> }
      @else { <app-icon name="AiOutlineStar" [size]="20" color="#f6ba00" class="mr-2 cursor-pointer" /> }
    }
  </div>`,
})
export class RatingsComponent {
  stars: string[] = [];
  @Input() set rating(value: number) {
    const rating = value || 0; const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push('fill');
      else if (i === Math.ceil(rating) && !Number.isInteger(rating)) stars.push('half');
      else stars.push('outline');
    }
    this.stars = stars;
  }
}
