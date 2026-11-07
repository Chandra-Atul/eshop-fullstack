import { Injectable, signal } from '@angular/core';

export interface ToastItem { id: number; type: 'success' | 'error' | 'info' | 'warning'; content: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<ToastItem[]>([]);
  autoClose = 5000;
  show(type: ToastItem['type'], content: string) {
    const id = ++this.counter;
    this.toasts.update((l) => [...l, { id, type, content }]);
    setTimeout(() => this.remove(id), this.autoClose);
    return id;
  }
  success(c: string) { return this.show('success', c); }
  error(c: string) { return this.show('error', c); }
  info(c: string) { return this.show('info', c); }
  warning(c: string) { return this.show('warning', c); }
  remove(id: number) { this.toasts.update((l) => l.filter((t) => t.id !== id)); }
  clear() { this.toasts.set([]); }
}
