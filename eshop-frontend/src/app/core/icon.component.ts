import { Component, Input, computed, signal } from '@angular/core';
import { ICONS } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span class="inline-flex items-center justify-center leading-none" [style.font-size.px]="size" [style.color]="color" [style.width.px]="size" [style.height.px]="size" [innerHTML]="svg()"></span>`,
})
export class IconComponent {
  private _name = signal('');
  @Input() set name(value: string) { this._name.set(value); }
  get name() { return this._name(); }
  @Input() size: number | string = 20;
  @Input() color?: string;
  @Input() title?: string;
  svg = computed(() => ICONS[this._name()] || '');
}
