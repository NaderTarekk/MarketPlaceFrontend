import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private http: HttpClient) {}

  translateArToEn(text: string): Observable<string> {
    if (!text || text.trim().length < 2) return of('');
    return this.http.post<{ translatedText: string }>(
      `${environment.translationUrl}/ar-to-en`, { text }
    ).pipe(map(res => res.translatedText || ''), catchError(() => of('')));
  }

  translateEnToAr(text: string): Observable<string> {
    if (!text || text.trim().length < 2) return of('');
    return this.http.post<{ translatedText: string }>(
      `${environment.translationUrl}/en-to-ar`, { text }
    ).pipe(map(res => res.translatedText || ''), catchError(() => of('')));
  }

  /**
   * Creates a debounced auto-translate setup.
   * Call inputChanged() on every keystroke, subscribe to result$.
   */
  createAutoTranslator(direction: 'ar-to-en' | 'en-to-ar') {
    const subject = new Subject<string>();
    const result$ = subject.pipe(
      distinctUntilChanged(),
      switchMap(text => direction === 'ar-to-en' ? this.translateArToEn(text) : this.translateEnToAr(text))
    );
    return { trigger: (text: string) => subject.next(text), result$ };
  }
}
