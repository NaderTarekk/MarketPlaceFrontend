// auth.service.ts - ضيف BehaviorSubject

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse, CompleteGoogleProfileDto, GoogleLoginDto, LoginDto, RegisterDto } from '../../../models/loginDto';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environment';
import { Profile, ProfileStats, UpdateProfile } from '../../../models/profile';
import { ApiResponse } from '../../../models/products';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
   private roleSubject = new BehaviorSubject<string | null>(this.getRole());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
public role$ = this.roleSubject.asObservable();
  constructor(private http: HttpClient) { }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/login`, dto);
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/register`, dto);
  }

  googleLogin(dto: GoogleLoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/google-login`, dto);
  }

  completeGoogleProfile(dto: CompleteGoogleProfileDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/complete-google-profile`, dto);
  }

  saveToken(token: string, role: string): void {
      console.log('🔐 saveToken called with role:', role);
  localStorage.setItem('NHC_MP_Token', token);
  localStorage.setItem('NHC_MP_Role', role);
    this.isLoggedInSubject.next(true); // ✅ Update الـ state
    this.roleSubject.next(role);
    console.log('🔐 BehaviorSubjects updated');
  }

  getToken(): string | null {
    return localStorage.getItem('NHC_MP_Token');
  }

  getRole(): string | null {
    return localStorage.getItem('NHC_MP_Role');
  }

  logout(): void {
    localStorage.removeItem('NHC_MP_Token');
    localStorage.removeItem('NHC_MP_Role');
    this.isLoggedInSubject.next(false); // ✅ Update الـ state
    this.roleSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  upgradeToVendor(data: any): Observable<any> {
  return this.http.post(`${environment.authUrl}/upgrade-to-vendor`, data);
}
  // ✅ جديد - نسيت كلمة المرور
  ForgotPassword(email: string): Observable<any> {
    return this.http.post(environment.authUrl + "/forgot-password", { email });
  }

  // ✅ جديد - التحقق من الكود
  VerifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(environment.authUrl + "/verify-reset-code", { email, code });
  }

  // ✅ جديد - إعادة تعيين كلمة المرور
  ResetPassword(data: { email: string, token: string, newPassword: string }): Observable<any> {
    return this.http.post(environment.authUrl + "/reset-password", data);
  }

  getProfile(): Observable<ApiResponse<Profile>> {
    return this.http.get<ApiResponse<Profile>>(environment.profileUrl);
  }

  updateProfile(data: UpdateProfile): Observable<ApiResponse<any>> {
    console.log(environment.profileUrl, data);
    
    return this.http.put<ApiResponse<any>>(environment.profileUrl, data);
  }

  uploadImage(file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${environment.profileUrl}/upload-image`, formData);
  }

  getProfileStats(): Observable<ApiResponse<ProfileStats>> {
    return this.http.get<ApiResponse<ProfileStats>>(`${environment.profileUrl}/stats`);
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.uid || decoded.sub || decoded.nameid || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // ✅ جديد - جلب User Info من الـ Token
  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}