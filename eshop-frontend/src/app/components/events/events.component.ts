import { Component, computed, inject } from '@angular/core';
import { styles } from '../../styles';
import { EventStore } from '../../core/state';
import { EventCardComponent } from './event-card.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [EventCardComponent],
  template: `<div>
    @if (!isLoading()) {
      <div class="{{ styles.section }}">
        <div class="{{ styles.heading }}"><h1>Popular Events</h1></div>
        <div class="w-full grid">
          @if (allEvents().length !== 0) { <app-event-card [data]="allEvents()[0]" /> }
          <h4>{{ allEvents()?.length === 0 ? 'No Events have!' : '' }}</h4>
        </div>
      </div>
    }
  </div>`,
})
export class EventsComponent {
  private eventStore = inject(EventStore);
  styles = styles;
  allEvents = computed(() => this.eventStore.allEvents() || []);
  isLoading = computed(() => this.eventStore.isLoading());
}
