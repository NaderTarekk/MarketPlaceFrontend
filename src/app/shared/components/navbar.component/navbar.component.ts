// navbar.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { combineLatest, debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
import { I18nService, Lang } from '../../../core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../modules/auth/services/auth.service';
import { Category } from '../../../models/category';
import { HomeService } from '../../../modules/home/services/home.service';
import { CartService } from '../../../modules/cart/services/cart.service';
import { ProductsService } from '../../../modules/products/services/products.service';
import { environment } from '../../../../environment';

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
  isLoading: boolean = false;
  private langSub!: Subscription;
  private authSub!: Subscription;
  isProfileMenuOpen = false;
  isSearchOpen = false;
  isCategoriesMenuOpen = false;
  categories: Category[] = [];
  cartCount = 0;
  isActionMenuOpen = false;
  isAdmin = false;
  isVendor = false;
  isAdminMenuOpen = false;
  isVendorMenuOpen = false;
  role: string | null = null;
  isShippingEmployee = false;
  isDeliveryAgent = false;
  adminPages = [
    { nameAr: 'صفحة الأدمن', nameEn: 'Admin Dashboard', route: '/admin', icon: 'fa-user-tie' },
    { nameAr: 'إدارة العلامات التجارية', nameEn: 'Manage Brands', route: '/brands', icon: 'fa-tags' },
    { nameAr: 'إدارة المنتجات', nameEn: 'Manage Products', route: '/products', icon: 'fa-box' },
    { nameAr: 'إدارة الأصناف', nameEn: 'Manage Categories', route: '/categories', icon: 'fa-layer-group' },
    { nameAr: 'إدارة التقييمات', nameEn: 'Manage Reviews', route: '/products/reviews', icon: 'fa-star' },
    // { nameAr: 'إدارة الطلبات', nameEn: 'Manage Orders', route: '/orders', icon: 'fa-shopping-bag' },
    { nameAr: 'الشكاوي', nameEn: 'Complaints', route: '/admin/complaints', icon: 'fa-exclamation-triangle' },
    { nameAr: 'المحافظات', nameEn: 'Governorates', route: '/admin/governorates', icon: 'fa-map-marker-alt' },
    { nameAr: 'إدارة الشحنات', nameEn: 'Shipping Management', route: '/shipping/employee', icon: 'fa-truck-fast' },
    { nameAr: 'إدارة البانرز', nameEn: 'Banners Management', route: '/admin/banners', icon: 'fa-solid fa-rectangle-ad' },
  ];

  isCategoriesDropdownOpen = false;

  vendorPages = [
    { nameAr: 'لوحة التحكم', nameEn: 'Dashboard', route: '/vendor', icon: 'fa-chart-line' },
    { nameAr: 'طلبات الشحن', nameEn: 'Shipping Orders', route: '/shipping/vendor', icon: 'fa-boxes-packing' },
  ];

  // أضف في الـ properties
  isCatalogOpen = false;
  searchResults: any[] = [];
  storeResults: any[] = [];
  isSearching = false;
  showSearchDropdown = false;
  private allStores: any[] = [];
  private searchSubject = new Subject<string>();
  readonly placeholderImage = 'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image';
  isInLoginPage = false;
  isNavbarHidden = false;
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    const currentScrollY = window.scrollY;
    if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
      this.isNavbarHidden = true;
    } else {
      this.isNavbarHidden = false;
    }
    this.lastScrollY = currentScrollY;
  }

  constructor(
    public i18n: I18nService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private translate: TranslateService,
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private productsService: ProductsService
  ) { }

  ngOnInit(): void {
    this.isInLoginPage = this.router.url.includes('auth/login');

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isInLoginPage = this.router.url.includes('auth/login');
      }
    });

    this.lang = localStorage.getItem('lang') || 'en';

    combineLatest([
      this.authService.isLoggedIn$,
      this.authService.role$
    ]).subscribe(([isLogged, role]) => {
      console.log('🧭 Navbar received:', { isLogged, role });
      this.isLogged = isLogged;
      this.role = role;

      this.isVendor = role === 'Vendor';
      this.isAdmin = role === 'Admin';
      this.isShippingEmployee = role === 'ShippingEmployee';
      this.isDeliveryAgent = role === 'DeliveryAgent';

      if (isLogged) {
        this.loadCartCount();
      } else {
        this.cartCount = 0;
      }

      this.updateNavLinks();
      this.cdr.detectChanges();
    });

    // Load stores for search
    this.productsService.getStores().subscribe({
      next: (res: any) => { if (res.success) this.allStores = res.data || []; },
      error: () => {}
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.searchResults = [];
          this.showSearchDropdown = false;
          return [];
        }
        this.isSearching = true;
        return this.productsService.search(query);
      })
    ).subscribe({
      next: (res: any) => {
        this.isSearching = false;
        if (res.success) {
          this.searchResults = res.data.slice(0, 5);
          // Filter stores matching search query
          const q = this.searchQuery.toLowerCase();
          this.storeResults = this.allStores.filter((s: any) =>
            s.vendorName?.toLowerCase().includes(q)
          ).slice(0, 3);
          this.showSearchDropdown = this.searchResults.length > 0 || this.storeResults.length > 0;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSearching = false;
        this.searchResults = [];
        this.storeResults = [];
      }
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    this.langSub = this.i18n.lang$Observable().subscribe(lang => {
      this.currentLang = lang;
      this.updateNavLinks();
      this.cdr.detectChanges();
    });

    this.loadCategories();
  }

  loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartCount = res.data.items.length;
          this.cdr.detectChanges();
        }
      }
    });
  }

  // Method للتحقق من الـ Role
  hasRole(roles: string[]): boolean {
    return roles.includes(this.role || '');
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  selectSearchResult(product: any): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.storeResults = [];
    this.router.navigate(['/products', product.id]);
  }

  goToStore(store: any): void {
    this.showSearchDropdown = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.storeResults = [];
    this.router.navigate(['/products'], { queryParams: { vendorId: store.vendorId, storeName: store.vendorName } });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.showSearchDropdown = false;
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  closeSearchDropdown(): void {
    setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }

  getProductImage(image: string): string {
    if (!image) return 'assets/images/placeholder.svg';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getProductName(product: any): string {
    return this.currentLang === 'ar' ? product.nameAr : product.nameEn;
  }

  toggleAdminMenu(): void {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;
    if (this.isAdminMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  toggleVendorMenu(): void {
    this.isVendorMenuOpen = !this.isVendorMenuOpen;
    if (this.isVendorMenuOpen) {
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
    this.isLoading = true;
    this.homeService.getCategories(true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categories = response.data
            .filter((cat: any) => !cat.parentId)
            .map((cat: any) => ({
              id: cat.id,
              nameAr: cat.nameAr,
              nameEn: cat.nameEn,
              image: cat.image,
              productCount: cat.productCount,
              hasChildren: cat.productCount > 0
            }));
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading categories:', err);
      }
    });
  }


  getCategoryImage(image: string | undefined): string {
    if (!image) return this.placeholderImage;
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;  // غيّر حسب الـ API بتاعك
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('placehold.co')) {
      img.src = this.placeholderImage;
    }
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

  toggleCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
    if (this.isCategoriesDropdownOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  closeCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen = false;
    document.body.classList.remove('menu-open');
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
        { label: 'profile', url: '/auth/profile' },
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

  goTo(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value && value !== 'all') {
      this.router.navigateByUrl(value);
    }
  }

  handleCategoryImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.includes('placeholder.svg')) {
      img.src = 'assets/images/placeholder.svg';
    }
  }
}