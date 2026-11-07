import { Component, signal } from '@angular/core';
import { HeaderComponent } from '../components/layout/header.component';
import { FooterComponent } from '../components/layout/footer.component';
import { styles } from '../styles';

@Component({ selector: 'app-faq-page', standalone: true, imports: [HeaderComponent, FooterComponent],
  template: `<div><app-header [activeHeading]="5" />
    <div class="{{ styles.section }} my-8"><h2 class="text-3xl font-bold text-gray-900 mb-8">FAQ</h2>
      <div class="mx-auto space-y-4">
        @for (item of faqItems; track item.tab) {
          <div class="border-b border-gray-200 pb-4">
            <button class="flex items-center justify-between w-full" (click)="toggleTab(item.tab)">
              <span class="text-lg font-medium text-gray-900">{{ item.question }}</span>
              @if (activeTab() === item.tab) {
                <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              } @else {
                <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              }
            </button>
            @if (activeTab() === item.tab) { <div class="mt-4"><p class="text-base text-gray-500">{{ item.answer }}</p></div> }
          </div>
        }
      </div>
    </div><app-footer /></div>` })
export class FaqPageComponent {
  styles = styles;
  activeTab = signal(0);
  faqItems = [
    { tab: 2, question: 'What is your return policy?', answer: "If you're not satisfied with your purchase, we accept returns within 30 days of delivery. To initiate a return, please email us at support@myecommercestore.com with your order number and a brief explanation of why you're returning the item." },
    { tab: 3, question: 'How do I track my order?', answer: 'You can track your order by clicking the tracking link in your shipping confirmation email, or by logging into your account on our website and viewing the order details.' },
    { tab: 4, question: 'How do I contact customer support?', answer: 'You can contact our customer support team by emailing us at support@myecommercestore.com, or by calling us at (555) 123-4567 between the hours of 9am and 5pm EST, Monday through Friday.' },
    { tab: 5, question: 'Can I change or cancel my order?', answer: "Unfortunately, once an order has been placed, we are not able to make changes or cancellations. If you no longer want the items you've ordered, you can return them for a refund within 30 days of delivery." },
    { tab: 6, question: 'Do you offer international shipping?', answer: 'Currently, we only offer shipping within the United States.' },
    { tab: 7, question: 'What payment methods do you accept?', answer: 'We accept visa,mastercard,paypal payment method also we have cash on delivery system.' },
  ];
  toggleTab(tab: number) { this.activeTab.set(this.activeTab() === tab ? 0 : tab); }
}
