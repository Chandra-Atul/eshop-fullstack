import { Component, Input } from '@angular/core';
import { styles } from '../../styles';

@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  template: `<div class="w-full flex justify-center"><div class="w-[90%] 800px:w-[50%] flex items-center flex-wrap">
    <div class="{{ styles.noramlFlex }}">
      <div class="{{ styles.cart_button }}"><span class="{{ styles.cart_button_text }}">1.Shipping</span></div>
      <div class="{{ active > 1 ? 'w-[30px] 800px:w-[70px] h-[4px] !bg-[#f63b60]' : 'w-[30px] 800px:w-[70px] h-[4px] !bg-[#FDE1E6]' }}"></div>
    </div>
    <div class="{{ styles.noramlFlex }}">
      <div class="{{ active > 1 ? styles.cart_button : styles.cart_button + ' !bg-[#FDE1E6]' }}">
        <span class="{{ active > 1 ? styles.cart_button_text : styles.cart_button_text + ' !text-[#f63b60]' }}">2.Payment</span></div>
    </div>
    <div class="{{ styles.noramlFlex }}">
      <div class="{{ active > 3 ? 'w-[30px] 800px:w-[70px] h-[4px] !bg-[#f63b60]' : 'w-[30px] 800px:w-[70px] h-[4px] !bg-[#FDE1E6]' }}"></div>
      <div class="{{ active > 2 ? styles.cart_button : styles.cart_button + ' !bg-[#FDE1E6]' }}">
        <span class="{{ active > 2 ? styles.cart_button_text : styles.cart_button_text + ' !text-[#f63b60]' }}">3.Success</span></div>
    </div>
  </div></div>`,
})
export class CheckoutStepsComponent { @Input() active = 1; styles = styles; }
