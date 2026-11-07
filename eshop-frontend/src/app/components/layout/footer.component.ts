import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/icon.component';
import { footerSupportLinks, footerProductLinks, footercompanyLinks } from '../../static/data';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `<div class="bg-[#000] text-white">
    <div class="md:flex md:justify-between md:items-center sm:px-12 px-4 bg-[#342ac8] py-7">
      <h1 class="lg:text-4xl text-3xl md:mb-0 mb-6 lg:leading-normal font-semibold md:w-2/5">
        <span class="text-[#56d879]">Subscribe</span> us for get news <br /> events and offers</h1>
      <div>
        <input type="text" required placeholder="Enter your email..." class="text-gray-800 sm:w-72 w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-2.5 rounded px-2 focus:outline-none" />
        <button class="bg-[#56d879] hover:bg-teal-500 duration-300 px-5 py-2.5 rounded-md text-whie md:w-auto w-full">Submit</button>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:gird-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16 sm:text-center">
      <ul class="px-5 text-center sm:text-start flex sm:block flex-col items-center">
        <img src="https://shopo.quomodothemes.website/assets/images/logo.svg" alt="" style="filter: brightness(0) invert(1)" /><br />
        <p>The home and elements needeed to create beatiful products.</p>
        <div class="flex items-center mt-[15px]">
          <app-icon name="AiFillFacebook" [size]="25" class="cursor-pointer" />
          <app-icon name="AiOutlineTwitter" [size]="25" class="cursor-pointer" style="margin-left:15px" />
          <app-icon name="AiFillInstagram" [size]="25" class="cursor-pointer" style="margin-left:15px" />
          <app-icon name="AiFillYoutube" [size]="25" class="cursor-pointer" style="margin-left:15px" />
        </div>
      </ul>
      <ul class="text-center sm:text-start"><h1 class="mb-1 font-semibold">Company</h1>
        @for (link of footerProductLinks; track $index) { <li><a class="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6" [routerLink]="link.link || '/'">{{ link.name }}</a></li> }
      </ul>
      <ul class="text-center sm:text-start"><h1 class="mb-1 font-semibold">Shop</h1>
        @for (link of footercompanyLinks; track $index) { <li><a class="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6" [routerLink]="link.link || '/'">{{ link.name }}</a></li> }
      </ul>
      <ul class="text-center sm:text-start"><h1 class="mb-1 font-semibold">Support</h1>
        @for (link of footerSupportLinks; track $index) { <li><a class="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6" [routerLink]="link.link || '/'">{{ link.name }}</a></li> }
      </ul>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center pt-2 text-gray-400 text-sm pb-8">
      <span>© 2024 Atul org. All rights reserved.</span><span>Terms · Privacy Policy</span>
      <div class="sm:block flex items-center justify-center w-full">
        <img src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75" alt="" /></div>
    </div>
  </div>`,
})
export class FooterComponent {
  footerProductLinks = footerProductLinks as any[];
  footercompanyLinks = footercompanyLinks as any[];
  footerSupportLinks = footerSupportLinks as any[];
}
