// navbar.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService, Lang } from '../../../core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { Category } from '../../../models/category';
import { HomeService } from '../../../modules/home/services/home.service';

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
  isCategoriesMenuOpen = false;
  categories: Category[] = [];
  cartCount = 0;
  isActionMenuOpen = false;
  isAdmin = false;
  isAdminMenuOpen = false;
  adminPages = [
    { nameAr: 'إدارة العلامات التجارية', nameEn: 'Manage Brands', route: '/brands', icon: 'fa-tags' },
    { nameAr: 'إدارة المنتجات', nameEn: 'Manage Products', route: '/products', icon: 'fa-box' },
    { nameAr: 'إدارة التقييمات', nameEn: 'Manage Reviews', route: '/products/reviews', icon: 'fa-star' },
    { nameAr: 'إدارة الطلبات', nameEn: 'Manage Orders', route: '/orders', icon: 'fa-shopping-bag' },
    { nameAr: 'إدارة المستخدمين', nameEn: 'Manage Users', route: '/users', icon: 'fa-users' },
  ];

  constructor(
    public i18n: I18nService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService,
    private homeService: HomeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';

    this.authSub = this.authService.isLoggedIn$.subscribe(isLogged => {
      this.isLogged = isLogged;

      if (isLogged) {
        this.isAdmin = localStorage.getItem('NHC_MP_Role') === 'Admin';
      } else {
        this.isAdmin = false;
      }

      this.updateNavLinks();
      this.cdr.detectChanges();  
    });

    this.langSub = this.i18n.lang$Observable().subscribe(lang => {
      this.currentLang = lang;
      this.updateNavLinks();
      this.cdr.detectChanges();
    });

    // ✅ Load categories
    this.loadCategories();
  }

  toggleAdminMenu(): void {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
    if (this.isAdminMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  navigateToAdminPage(route: string): void {
    this.router.navigate([route]);
    this.toggleAdminMenu();
  }

  toggleActionMenu(): void {
    this.isActionMenuOpen = !this.isActionMenuOpen;
  }
  loadCategories(): void {
    this.homeService.getCategories(true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data.map((cat: any) => ({
            id: cat.id,
            nameAr: cat.nameAr,
            nameEn: cat.nameEn,
            productCount: cat.productCount,
            hasChildren: cat.productCount > 0
          }));
        }

      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  toggleCategoriesMenu(): void {
    this.isCategoriesMenuOpen = !this.isCategoriesMenuOpen;

    // منع scroll على الـ body لما الـ menu مفتوح
    if (this.isCategoriesMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
    console.log('toggleProfileMenu called, isLogged:', this.isLogged);
    // منع scroll على الـ body لما الـ menu مفتوح
    if (this.isProfileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
    this.cdr.markForCheck(); // ✅ Force change detection to update the UI immediately
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

  goTo(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value && value !== 'all') {
      this.router.navigateByUrl(value);
    }
  }
}