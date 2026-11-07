import { Component, computed, inject } from '@angular/core';
import { EventCardComponent } from '../components/events/event-card.component';
import { HeaderComponent } from '../components/layout/header.component';
import { LoaderComponent } from '../components/layout/loader.component';
import { EventStore } from '../core/state';

@Component({ selector: 'app-events-page', standalone: true, imports: [EventCardComponent, HeaderComponent, LoaderComponent],
  template: `@if (isLoading()) { <app-loader /> } @else { <div><app-header [activeHeading]="4" />
    @if (allEvents().length) { <app-event-card [active]="true" [data]="allEvents()[0]" /> }</div> }` })
export class EventsPageComponent {
  private eventStore = inject(EventStore);
  allEvents = computed(() => this.eventStore.allEvents() || []);
  isLoading = computed(() => this.eventStore.isLoading());
}
