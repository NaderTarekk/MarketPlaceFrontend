import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
   private state$ = new BehaviorSubject<ToastState>({
    show: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  toast$ = this.state$.asObservable();

  private timer: any;

  show(message: string, type: ToastType = 'success', duration = 3000) {
    clearTimeout(this.timer);

    this.state$.next({ show: true, message, type, duration });

    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    const current = this.state$.value;
    this.state$.next({ ...current, show: false });
  }

  success(message: string, duration = 3000) { this.show(message, 'success', duration); }
  error(message: string, duration = 3000)   { this.show(message, 'error', duration); }
  info(message: string, duration = 3000)    { this.show(message, 'info', duration); }
  warning(message: string, duration = 3000) { this.show(message, 'warning', duration); }
}
