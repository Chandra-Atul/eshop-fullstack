import { Component, computed, inject } from '@angular/core';
import { styles } from '../../styles';
import { EventStore } from '../../core/state';
import { EventCardComponent } from './event-card.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [EventCardComponent],
  template: `
    <section class="{{ styles.section }} my-12" id="popular-events">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-[#e44343] animate-ping"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-red-500">
              Flash Deals & Campaigns
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Popular Events
          </h2>
        </div>

        @if (allEvents().length > 0) {
          <span class="text-xs font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-200">
            {{ allEvents().length }} {{ allEvents().length === 1 ? 'Live Event' : 'Live Events' }}
          </span>
        }
      </div>

      <!-- Loading Skeleton State -->
      @if (isLoading()) {
        <div class="w-full bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 animate-pulse my-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-5 bg-gray-100 rounded-xl h-[300px]"></div>
            <div class="lg:col-span-7 space-y-4">
              <div class="h-4 bg-gray-100 rounded-md w-1/4"></div>
              <div class="h-7 bg-gray-100 rounded-md w-3/4"></div>
              <div class="h-16 bg-gray-100 rounded-md w-full"></div>
              <div class="h-10 bg-gray-100 rounded-md w-1/3"></div>
              <div class="flex gap-4 pt-2">
                <div class="h-11 bg-gray-100 rounded-xl w-32"></div>
                <div class="h-11 bg-gray-100 rounded-xl w-36"></div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Content List -->
        <div class="w-full">
          @if (allEvents().length > 0) {
            <!-- Renders the primary featured event card -->
            <app-event-card [data]="allEvents()[0]" />
          } @else {
            <!-- Empty State Card -->
            <div class="w-full bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center my-6 shadow-2xs">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-base font-bold text-gray-900">No Active Events Right Now</h3>
              <p class="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Check back soon! New seasonal promotions and limited-time marketplace deals are added regularly.
              </p>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class EventsComponent {
  private eventStore = inject(EventStore);

  styles = styles;
  allEvents = computed(() => this.eventStore.allEvents() || []);
  isLoading = computed(() => this.eventStore.isLoading());
}