import { Component, Input, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS } from './icons';

// Optional: friendly aliases for common icons
const ICON_ALIASES: Record<string, string> = {
  cart: 'AiOutlineShoppingCart',
  'cart-plus': 'BsCartPlus',
  wishlist: 'AiOutlineHeart',
  'wishlist-fill': 'AiFillHeart',
  profile: 'RxAvatar',
  search: 'AiOutlineSearch',
  settings: 'CiSettings',
  edit: 'BsPencil',
  trash: 'AiOutlineDelete',
  menu: 'BiMenuAltLeft',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center justify-center leading-none"
      [style.font-size]="computedSize()"
      [style.width]="computedSize()"
      [style.height]="computedSize()"
      [style.color]="color || 'currentColor'"
      [attr.title]="title"
      [innerHTML]="safeSvg()"
    ></span>
  `,
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);
  private _name = signal('');

  @Input() set name(value: string) {
    this._name.set(value);
  }
  get name() {
    return this._name();
  }

  @Input() size: number | string = 20;
  @Input() color?: string;
  @Input() title?: string;

  // Format size safely whether passed as 24, "24", or "24px"
  computedSize = computed(() => {
    const s = this.size;
    return typeof s === 'number' || !isNaN(Number(s)) ? `${s}px` : s;
  });

  // Resolve name (support exact key or alias) and bypass Angular sanitizer
  safeSvg = computed<SafeHtml>(() => {
    const iconName = this._name();
    const resolvedKey = ICON_ALIASES[iconName.toLowerCase()] || iconName;
    const rawSvg = ICONS[resolvedKey] || '';
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  });
}