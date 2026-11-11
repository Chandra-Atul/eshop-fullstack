import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Positioned fixed at bottom-right with high z-index -->
    <div class="fixed bottom-5 right-5 z-[999999] flex flex-col-reverse gap-2.5 max-w-sm w-full pointer-events-none">
      @for (t of toastService.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl text-white font-medium text-sm transition-all transform animate-in slide-in-from-bottom-3 fade-in duration-200"
          [class.bg-emerald-600]="t.type === 'success'"
          [class.bg-rose-600]="t.type === 'error'"
          [class.bg-indigo-600]="t.type === 'info'"
        >
          <div class="flex items-center gap-3">
            @if (t.type === 'success') {
              <app-icon name="AiOutlineCheckCircle" [size]="20" />
            } @else if (t.type === 'error') {
              <app-icon name="AiOutlineCloseCircle" [size]="20" />
            } @else {
              <app-icon name="AiOutlineInfoCircle" [size]="20" />
            }
            <span class="leading-tight">{{ t.text }}</span>
          </div>

          <button
            type="button"
            (click)="toastService.remove(t.id)"
            class="text-white/80 hover:text-white ml-3 cursor-pointer"
          >
            <app-icon name="RxCross1" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  toastService = inject(ToastService);
}