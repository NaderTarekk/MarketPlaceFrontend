import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  private isAuthFlowUrl(url: string): boolean {
    return /\/api\/Auth\/(login|register|forgot-password|verify-reset-code|reset-password|google-login|complete-google-profile)/i.test(url);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.token;
    const isAuthFlow = this.isAuthFlowUrl(req.url);

    const authReq = token && !isAuthFlow
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (isAuthFlow) {
          return throwError(() => err);
        }
        if (err.status === 401) {
          this.auth.logout();
          this.router.navigate(['/auth/login']);
        }
        else if (err.status === 403) {
          this.router.navigate(['/']);
        }
        return throwError(() => err);
      })
    );
  }
}