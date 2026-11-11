import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(text: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
    if (!text) return;
    const id = Date.now() + Math.random();
    const newToast: ToastMessage = { id, text, type };

    this.toasts.update((current) => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(text: string, duration?: number) {
    this.show(text, 'success', duration);
  }

  error(text: string, duration?: number) {
    this.show(text, 'error', duration);
  }

  info(text: string, duration?: number) {
    this.show(text, 'info', duration);
  }

  remove(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}