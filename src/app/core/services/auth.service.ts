import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  get token(): string | null {
    return localStorage.getItem('NHC_MP_Token');
  }

  get role(): string | null {
    return localStorage.getItem('NHC_MP_Role');
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  logout() {
    localStorage.removeItem('NHC_MP_Token');
    localStorage.removeItem('NHC_MP_Role');
  }
}
