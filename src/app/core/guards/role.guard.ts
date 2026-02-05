import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // 1) لازم يكون مسجل دخول
    // if (!this.auth.isLoggedIn()) {
    //   return this.router.createUrlTree(['/auth/login']);
    // }

    // 2) لو فيه Roles مطلوبة للRoute
    const allowedRoles = route.data['roles'] as string[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const userRole = this.auth.role;
    if (userRole && allowedRoles.includes(userRole)) return true;

    // 3) مش مسموح
    return this.router.createUrlTree(['/']);
  }  
}
