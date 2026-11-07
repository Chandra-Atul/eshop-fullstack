import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie',
  standalone: true,
  template: `<div #host [style.width.px]="width" [style.height.px]="height"></div>`,
})
export class LottieComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  @Input() path = '';
  @Input() width: number | string = 300;
  @Input() height: number | string = 300;
  @Input() loop = true;
  @Input() autoplay = true;
  private animation?: AnimationItem;

  async ngOnInit() {
    try {
      const animationData: any = await this.http.get(this.path).toPromise();
      if (!this.host) return;
      this.animation = lottie.loadAnimation({ container: this.host.nativeElement, renderer: 'svg', loop: this.loop, autoplay: this.autoplay, animationData, rendererSettings: { preserveAspectRatio: 'xMidYMid slice' } });
    } catch (e) { console.error('lottie failed', e); }
  }
  ngOnDestroy() { this.animation?.destroy(); }
}
