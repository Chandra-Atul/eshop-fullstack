import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      @for (t of toast.toasts(); track t.id) {
        <div (click)="toast.remove(t.id)" class="min-w-[280px] max-w-[380px] cursor-pointer rounded-md border-l-4 bg-[#121212] px-4 py-3 text-[15px] text-white shadow-lg"
          [class.border-[#07bc0c]]="t.type === 'success'" [class.border-[#e74c3c]]="t.type === 'error'"
          [class.border-[#3498db]]="t.type === 'info'" [class.border-[#f1c40f]]="t.type === 'warning'">
          {{ t.content }}
        </div>
      }
    </div>`,
})
export class ToastContainerComponent { toast = inject(ToastService); }
