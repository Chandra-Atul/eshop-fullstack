import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { server } from '../../config';
import { EventModel } from '../../core/models';

@Component({
  selector: 'app-count-down',
  standalone: true,
  template: `<div>
    @if (timerComponents().length) { @for (t of timerComponents(); track $index) { <span class="text-[25px] text-[#475ad2]">{{ t }}</span> } }
    @else { <span class="text-[red] text-[25px]">Time's Up</span> }
  </div>`,
})
export class CountDownComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  @Input() data!: EventModel;
  timerComponents = signal<string[]>([]);
  private timer: any;
  private counted = false;
  ngOnInit() { this.tick(); this.timer = setInterval(() => this.tick(), 1000); }
  ngOnDestroy() { clearInterval(this.timer); }
  private tick() {
    const diff = +new Date(this.data.Finish_Date) - +new Date();
    const timeLeft: any = {};
    if (diff > 0) {
      timeLeft.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      timeLeft.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      timeLeft.minutes = Math.floor((diff / 1000 / 60) % 60);
      timeLeft.seconds = Math.floor((diff / 1000) % 60);
    }
    const components: string[] = [];
    Object.keys(timeLeft).forEach((interval) => { if (timeLeft[interval]) components.push(`${timeLeft[interval]} ${interval} `); });
    this.timerComponents.set(components);
    if (components.length === 0 && !this.counted) {
      this.counted = true;
      this.api.delete(`${server}/event/delete-shop-event/${this.data._id}`).catch(() => {});
    }
  }
}
