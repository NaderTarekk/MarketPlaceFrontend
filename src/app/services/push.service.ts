import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private apiUrl = `${environment.baseApi}/api/Push`;
  private publicKey: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(private http: HttpClient) {}

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  async init(): Promise<void> {
    if (!this.isSupported()) return;
    try {
      this.registration = await navigator.serviceWorker.register('/sw-push.js');
    } catch (e) {
      console.error('SW registration failed', e);
    }
  }

  async subscribe(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      // Get permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      // Make sure SW is registered
      if (!this.registration) {
        await this.init();
      }
      if (!this.registration) return false;

      // Get VAPID public key from server
      if (!this.publicKey) {
        const res: any = await firstValueFrom(this.http.get(`${this.apiUrl}/public-key`));
        this.publicKey = res.publicKey;
      }
      if (!this.publicKey) return false;

      // Subscribe
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey).buffer as ArrayBuffer
      });

      // Send to backend
      const json = subscription.toJSON();
      await firstValueFrom(this.http.post(`${this.apiUrl}/subscribe`, {
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys?.['p256dh'] || '',
          auth: json.keys?.['auth'] || ''
        }
      }));

      localStorage.setItem('push_subscribed', '1');
      return true;
    } catch (e) {
      console.error('Push subscribe failed', e);
      return false;
    }
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!this.registration) return;
      const sub = await this.registration.pushManager.getSubscription();
      if (sub) {
        await firstValueFrom(this.http.post(`${this.apiUrl}/unsubscribe`, { endpoint: sub.endpoint }));
        await sub.unsubscribe();
      }
      localStorage.removeItem('push_subscribed');
    } catch (e) {
      console.error('Push unsubscribe failed', e);
    }
  }

  hasDismissedPrompt(): boolean {
    return localStorage.getItem('push_prompt_dismissed') === '1';
  }

  dismissPrompt(): void {
    localStorage.setItem('push_prompt_dismissed', '1');
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
