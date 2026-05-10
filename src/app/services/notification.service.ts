import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environment';

export interface NotificationItem {
  id: number;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: number; // 0=ProductApproved, 1=ProductRejected, 2=OrderUpdate, etc.
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.baseApi}/api/Notifications`;
  private unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  loadUnreadCount(): void {
    this.http.get<any>(`${this.apiUrl}/unread-count`).subscribe({
      next: (res) => { if (res.success) this.unreadCount$.next(res.data); },
      error: () => {}
    });
  }

  startPolling(intervalMs: number = 60000): void {
    this.loadUnreadCount();
    interval(intervalMs).subscribe(() => this.loadUnreadCount());
  }

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount$.next(0))
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadUnreadCount())
    );
  }
}
