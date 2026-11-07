import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { navItems } from '../../static/data';
import { styles } from '../../styles';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `<div class="block 800px:{{ styles.noramlFlex }}">
    @for (i of navItems; track i.title; let index = $index) {
      <div class="flex"><a [routerLink]="i.url" [class]="(active === index + 1 ? 'text-[#17dd1f]' : 'text-black 800px:text-[#fff]') + ' pb-[30px] 800px:pb-0 font-[500] px-6 cursor-pointer'">{{ i.title }}</a></div>
    }
  </div>`,
})
export class NavbarComponent { @Input() active?: number; navItems = navItems; styles = styles; }
