// navbar.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService, Lang } from '../../../core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';

export interface NavLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  searchQuery = '';
  currentLang: Lang = 'ar';
  lang: string = '';
  navLinks: any[] = [];
  isLogged: boolean = false;
  private langSub!: Subscription;
  private authSub!: Subscription;
  isProfileMenuOpen = false;
  isSearchOpen = false;
  cartCount = 0; 

  constructor(
    public i18n: I18nService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';

    // ✅ Subscribe على الـ auth state
    this.authSub = this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLogged = isLogged;
      this.updateNavLinks();
    });

    this.langSub = this.i18n.lang$Observable().subscribe(lang => {
      this.currentLang = lang;
      this.updateNavLinks();
    });
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  handleNavClick(link: any): void {
    if (link.func === 'logout') {
      this.logout();
    }
  }

  toggleLang(): void {
    const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.i18n.switch(newLang as Lang);
    localStorage.setItem('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLang);
    this.translate.use(newLang);
  }


toggleProfileMenu(): void {
  this.isProfileMenuOpen = !this.isProfileMenuOpen;
}

  ChangeLag(event: any) {
    const selectedLang = event.target.value;
    localStorage.setItem('lang', selectedLang);
    this.translate.use(selectedLang);
  }

  switchLang(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.i18n.switch(lang as Lang);
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    this.translate.use(lang);
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  private updateNavLinks(): void {
    if (this.isLogged) {
      // ✅ Links للـ logged in users
      this.navLinks = [
        { label: 'home', url: '/' },
        { label: 'products', url: '/products' },
        { label: 'profile', url: '/profile' },
        { label: 'logout', func: 'logout' },
      ];
    } else {
      // ✅ Links للـ guests
      this.navLinks = [
        { label: 'home', url: '/' },
        { label: 'products', url: '/products' },
        { label: 'login', url: '/auth/login' },
      ];
    }
  }

  logout() {
    this.authService.logout(); // ✅ هيعمل update للـ BehaviorSubject
    this.toastr.info(this.i18n.currentLang === 'ar' ? 'تم تسجيل الخروج من حسابك' : 'Logged out successfully');
    this.router.navigate(['/auth/login']);
  }

  toggleMobileMenu(label?: any): void {
    if (label === 'logout') {
      this.logout();
      return;
    }
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }
}