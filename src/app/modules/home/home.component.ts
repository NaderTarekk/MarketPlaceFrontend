// src/app/modules/home/home.component.ts
import {
  ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';
import { HomeService } from './services/home.service';
import { ProductsService } from '../products/services/products.service';
import { CartService } from '../cart/services/cart.service';
import { Category } from '../../models/category';
import { environment } from '../../../environment';
import { GovernorateService } from '../adamin/services/governorate.service';

// ─── kept for product-card compatibility ───────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  nameKey: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  isWishlisted: boolean;
}

interface ApiBanner {
  id: number;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
  imageUrl: string;
  buttonText: string;
  buttonTextAr: string;
  buttonLink: string;
}

interface FeaturedSection {
  id: number;
  title: string;
  titleAr: string;
  sectionType: string;
  displayType: string;
  itemsToShow: number;
  products?: any[];
  isLoadingProducts?: boolean;
}

interface HomeStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  satisfactionRate: number;
}

interface Testimonial {
  id: number;
  customerName: string;
  customerImage?: string;
  rating: number;
  comment: string;
  commentAr: string;
  createdAt: Date;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  // ── UI ─────────────────────────────────────────────────────────────────────
  isSidebarOpen = false;
  currentBannerIndex = 0;
  currentTestimonialIndex = 0;

  // ── Loading flags ──────────────────────────────────────────────────────────
  isLoadingBanners = true;
  isLoadingSections = true;
  isLoadingStats = true;
  isLoadingTestimonials = true;

  // ── Data ───────────────────────────────────────────────────────────────────
  categories: Category[] = [];
  apiBanners: ApiBanner[] = [];
  featuredSections: FeaturedSection[] = [];
  testimonials: Testimonial[] = [];
  stats: HomeStats = { totalProducts: 0, totalCustomers: 0, totalOrders: 0, satisfactionRate: 0 };
  animatedStats = { products: 0, customers: 0, orders: 0, satisfaction: 0 };

  // ── Static fallback banners (shown until API responds) ─────────────────────
  staticBanners = [
    {
      titleKey: 'banner_upto', subtitleKey: 'banner_voucher', limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=400&fit=crop',
    },
    {
      titleKey: 'banner_upto', subtitleKey: 'banner_voucher', limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=400&fit=crop',
    },
    {
      titleKey: 'banner_upto', subtitleKey: 'banner_voucher', limitedKey: 'banner_limited',
      bg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=400&fit=crop',
    }
  ];
  currentStaticBanner = 0;

  // ── Static fallback products ───────────────────────────────────────────────
  staticProducts: Product[] = [
    { id: 1, nameKey: 'prod_keyboard', name: 'AK-900 Wired Keyboard', brand: 'Logitech', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&h=350', price: 632, originalPrice: 1100, discount: 40, rating: 4, reviewCount: 35, isWishlisted: false },
    { id: 2, nameKey: 'prod_gamepad', name: 'HAVIT HV-G92 Gamepad', brand: 'HAVIT', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=400&h=350', price: 120, originalPrice: 160, discount: 25, rating: 4, reviewCount: 446, isWishlisted: false },
    { id: 3, nameKey: 'prod_monitor', name: 'IPS LCD Gaming Monitor', brand: 'IPS', image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&w=400&h=350', price: 310, originalPrice: 400, discount: 20, rating: 4, reviewCount: 371, isWishlisted: false },
    { id: 4, nameKey: 'prod_chair', name: 'E-Series Comfort Chair', brand: 'Seatmatic', image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format&fit=crop&w=400&h=350', price: 375, originalPrice: 400, discount: 10, rating: 4, reviewCount: 267, isWishlisted: false },
  ];

  // ── Search ─────────────────────────────────────────────────────────────────
  searchQuery = '';
  searchResults: any[] = [];
  isSearching = false;
  showSearchDropdown = false;
  private searchSubject = new Subject<string>();

  // ── Fallback products (shown when no featured sections) ────────────────────
  fallbackProducts: any[] = [];
  isLoadingFallback = false;
  fallbackPage = 1;
  fallbackPageSize = 12;
  hasMoreProducts = true;
  isLoadingMore = false;

  // ── Delivery Estimate ─────────────────────────────────────────────────────
  userDeliveryDays: number | null = null;

  // ── Newsletter ─────────────────────────────────────────────────────────────
  newsletterEmail = '';
  isSubscribing = false;

  // ── Timers ─────────────────────────────────────────────────────────────────
  private bannerTimer: any = null;
  private statTimers: any[] = [];

  constructor(
    public i18n: I18nService,
    private router: Router,
    private homeService: HomeService,
    private productsService: ProductsService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private governorateService: GovernorateService
  ) { }

  // ══════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.loadCategories();
    this.loadBanners();
    this.loadTopSellingProducts();
    this.loadUserDeliveryDays();
    // this.loadFeaturedSections();
    this.isLoadingSections = false;
    this.loadStats();
    this.loadTestimonials();
    this.setupSearch();
    this.startBannerAutoplay();
  }

  ngOnDestroy(): void {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
    this.statTimers.forEach(t => clearInterval(t));
    this.scrollObserver?.disconnect();
    this.revealObserver?.disconnect();
  }

  // ── Data loaders ───────────────────────────────────────────────────────────

  loadCategories(): void {
    this.homeService.getCategories(true).subscribe({
      next: (res: any) => {
        if (res.success)
          this.categories = res.data
            .filter((c: any) => c.parentId === null || c.parentId === undefined)
            .map((c: any) => ({
              id: c.id, nameAr: c.nameAr, nameEn: c.nameEn,
              productCount: c.productCount, hasChildren: c.hasChildren,
              image: c.image || null
            }));
        this.cdr.detectChanges();
      },
      error: err => console.error('categories:', err)
    });
  }

  loadBanners(): void {
    this.isLoadingBanners = true;
    this.homeService.getBanners().subscribe({
      next: (res: any) => {
        console.log('Banners response:', res); // ✅ شيك الـ response
        if (res.success) {
          this.apiBanners = res.data || [];
          console.log('Loaded banners:', this.apiBanners); // ✅ شيك البانرات
        }
        this.isLoadingBanners = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Banners error:', err); // ✅ شيك الـ error
        this.isLoadingBanners = false;
        this.cdr.detectChanges();
      }
    });
  }

  // loadFeaturedSections(): void {
  //   this.isLoadingSections = true;
  //   this.homeService.getTopSelling(12).subscribe({
  //     next: (res: any) => this.ngZone.run(() => {
  //       if (res.success) {
  //         this.featuredSections = (res.data || []).map((s: FeaturedSection) => ({
  //           ...s, products: [], isLoadingProducts: s.sectionType === 'products'
  //         }));
  //         this.featuredSections.forEach(s => {
  //           if (s.sectionType === 'products') this.loadSectionProducts(s);
  //         });
  //       }
  //       this.isLoadingSections = false;
  //       // If no sections from API, load fallback products
  //       if (this.featuredSections.length === 0) this.loadFallbackProducts();
  //       this.cdr.detectChanges();
  //     }),
  //     error: () => this.ngZone.run(() => {
  //       this.isLoadingSections = false;
  //       this.loadFallbackProducts();
  //       this.cdr.detectChanges();
  //     })
  //   });
  // }

  loadTopSellingProducts(): void {
    this.isLoadingFallback = true;
    this.productsService.getAll({
      page: 1,
      pageSize: this.fallbackPageSize,
      sortBy: 'salesCount',
      sortDesc: true
    }).subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success && res.data) {
          this.fallbackProducts = this.mapProducts(res.data);
          this.hasMoreProducts = res.data.length >= this.fallbackPageSize;
          this.fallbackPage = 2;
        }
        this.isLoadingFallback = false;
        this.cdr.detectChanges();
        this.setupScrollObserver();
      }),
      error: () => this.ngZone.run(() => {
        this.isLoadingFallback = false;
        this.cdr.detectChanges();
      })
    });
  }

  loadMoreProducts(): void {
    if (this.isLoadingMore || !this.hasMoreProducts) return;
    this.isLoadingMore = true;
    this.cdr.detectChanges();

    this.productsService.getAll({
      page: this.fallbackPage,
      pageSize: this.fallbackPageSize,
      sortBy: 'salesCount',
      sortDesc: true
    }).subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success && res.data) {
          this.fallbackProducts = [...this.fallbackProducts, ...this.mapProducts(res.data)];
          this.hasMoreProducts = res.data.length >= this.fallbackPageSize;
          this.fallbackPage++;
        }
        this.isLoadingMore = false;
        this.cdr.detectChanges();
        this.observeNewCards();
      }),
      error: () => this.ngZone.run(() => {
        this.isLoadingMore = false;
        this.cdr.detectChanges();
      })
    });
  }

  private mapProducts(data: any[]): any[] {
    return data.map((p: any) => ({
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      mainImage: p.mainImage,
      descriptionAr: p.descriptionAr,
      descriptionEn: p.descriptionEn,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      stock: p.stock ?? 1,
      isWishlisted: false
    }));
  }

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  private scrollObserver?: IntersectionObserver;
  private revealObserver?: IntersectionObserver;

  setupScrollObserver(): void {
    setTimeout(() => {
      const el = this.scrollSentinel?.nativeElement;
      if (!el) return;
      this.scrollObserver?.disconnect();
      this.scrollObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && this.hasMoreProducts && !this.isLoadingMore) {
            this.ngZone.run(() => this.loadMoreProducts());
          }
        },
        { rootMargin: '400px' }
      );
      this.scrollObserver.observe(el);
      this.setupRevealObserver();
    }, 500);
  }

  setupRevealObserver(): void {
    this.revealObserver?.disconnect();
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.revealObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    this.observeNewCards();
  }

  observeNewCards(): void {
    setTimeout(() => {
      const cards = document.querySelectorAll('.product-reveal:not(.visible)');
      cards.forEach(card => this.revealObserver?.observe(card));
    }, 100);
  }

  loadFallbackProducts(): void {
    this.isLoadingFallback = true;
    this.productsService.getFeatured(8).subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success) this.fallbackProducts = res.data || [];
        this.isLoadingFallback = false;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => { this.isLoadingFallback = false; this.cdr.detectChanges(); })
    });
  }

  loadSectionProducts(section: FeaturedSection): void {
    this.homeService.getSectionProducts(section.id).subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success) section.products = res.data || [];
        section.isLoadingProducts = false;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => { section.isLoadingProducts = false; this.cdr.detectChanges(); })
    });
  }

  loadStats(): void {
    this.isLoadingStats = true;
    this.homeService.getStats().subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success) { this.stats = res.data; this.animateStats(); }
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => { this.isLoadingStats = false; this.cdr.detectChanges(); })
    });
  }

  loadTestimonials(): void {
    this.isLoadingTestimonials = true;
    this.homeService.getTestimonials().subscribe({
      next: (res: any) => this.ngZone.run(() => {
        if (res.success) this.testimonials = res.data || [];
        this.isLoadingTestimonials = false;
        this.cdr.detectChanges();
      }),
      error: () => this.ngZone.run(() => { this.isLoadingTestimonials = false; this.cdr.detectChanges(); })
    });
  }

  // ── Stats counter animation ────────────────────────────────────────────────

  animateStats(): void {
    const steps = 60, ms = 2000 / steps;
    const animate = (key: keyof typeof this.animatedStats, target: number) => {
      let cur = 0, inc = target / steps;
      // Run entirely outside Angular — update value directly, then markForCheck
      this.ngZone.runOutsideAngular(() => {
        const t = setInterval(() => {
          cur += inc;
          const done = cur >= target;
          // Mutate directly (no zone re-entry) then schedule a single mark
          this.animatedStats[key] = done ? Math.round(target) : Math.floor(cur);
          this.cdr.markForCheck();
          if (done) clearInterval(t);
        }, ms);
        this.statTimers.push(t);
      });
    };
    animate('products', this.stats.totalProducts);
    animate('customers', this.stats.totalCustomers);
    animate('orders', this.stats.totalOrders);
    animate('satisfaction', this.stats.satisfactionRate);
  }

  // ── Banner carousel ────────────────────────────────────────────────────────

  startBannerAutoplay(): void {
    this.ngZone.runOutsideAngular(() => {
      this.bannerTimer = setInterval(() => {
        this.ngZone.run(() => this.nextBanner());
      }, 5000);
    });
  }

  get totalBanners(): number {
    return this.isLoadingBanners || this.apiBanners.length === 0
      ? this.staticBanners.length
      : this.apiBanners.length;
  }

  // Used by *ngFor for banner dots — avoids ternary expression inside template
  get bannerDots(): any[] {
    return this.apiBanners.length > 0 ? this.apiBanners : this.staticBanners;
  }

  nextBanner(): void {
    this.currentBannerIndex = (this.currentBannerIndex + 1) % this.totalBanners;
    this.currentStaticBanner = (this.currentStaticBanner + 1) % this.staticBanners.length;
  }
  prevBanner(): void {
    this.currentBannerIndex = (this.currentBannerIndex - 1 + this.totalBanners) % this.totalBanners;
    this.currentStaticBanner = (this.currentStaticBanner - 1 + this.staticBanners.length) % this.staticBanners.length;
  }
  goToBanner(i: number): void { this.currentBannerIndex = i; }

  // ── Testimonial carousel ───────────────────────────────────────────────────

  nextTestimonial(): void {
    if (this.testimonials.length)
      this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }
  prevTestimonial(): void {
    if (this.testimonials.length)
      this.currentTestimonialIndex = (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) { this.searchResults = []; this.showSearchDropdown = false; return []; }
        this.isSearching = true;
        return this.productsService.search(q);
      })
    ).subscribe({
      next: (res: any) => {
        this.isSearching = false;
        if (res.success) {
          this.searchResults = res.data.slice(0, 6);
          this.showSearchDropdown = this.searchResults.length > 0 || this.searchQuery.length >= 2;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.isSearching = false; this.searchResults = []; }
    });
  }

  onSearchInput(e: Event): void {
    const q = (e.target as HTMLInputElement).value;
    this.searchQuery = q;
    this.searchSubject.next(q);
  }
  selectSearchResult(p: any): void {
    this.showSearchDropdown = false; this.searchQuery = ''; this.searchResults = [];
    this.router.navigate(['/products', p.id]);
  }
  onSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.showSearchDropdown = false;
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
    this.searchQuery = ''; this.searchResults = [];
  }
  closeSearchDropdown(): void { setTimeout(() => { this.showSearchDropdown = false; }, 200); }

  // ── Newsletter ─────────────────────────────────────────────────────────────

  subscribeNewsletter(): void {
    if (!this.newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newsletterEmail)) return;
    this.isSubscribing = true;
    this.homeService.subscribeNewsletter(this.newsletterEmail).subscribe({
      next: () => { this.isSubscribing = false; this.newsletterEmail = ''; },
      error: () => { this.isSubscribing = false; }
    });
  }

  // ── Cart ───────────────────────────────────────────────────────────────────

  addToCart(product: any, event?: Event): void {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (!localStorage.getItem('NHC_MP_Token')) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(product.id, 1).subscribe();
  }

  // ── Misc helpers ───────────────────────────────────────────────────────────

  toggleSidebar(): void { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleWishlist(p: any): void { p.isWishlisted = !p.isWishlisted; }

  getProductName(p: any): string { return this.i18n.currentLang === 'ar' ? p.nameAr : p.nameEn; }
  getProductDescription(p: any): string { return this.i18n.currentLang === 'ar' ? p.descriptionAr : p.descriptionEn; }
  getBannerTitle(b: ApiBanner): string { return this.i18n.currentLang === 'ar' ? b.titleAr : b.title; }
  getBannerSubtitle(b: ApiBanner): string { return this.i18n.currentLang === 'ar' ? b.subtitleAr : b.subtitle; }
  getBannerBtn(b: ApiBanner): string { return this.i18n.currentLang === 'ar' ? b.buttonTextAr : b.buttonText; }
  getSectionTitle(s: FeaturedSection): string { return this.i18n.currentLang === 'ar' ? s.titleAr : s.title; }
  getTestimonialComment(t: Testimonial): string { return this.i18n.currentLang === 'ar' ? t.commentAr : t.comment; }
  getCategoryName(c: any): string { return this.i18n.currentLang === 'ar' ? c.nameAr : c.nameEn; }

  getProductImage(img: string): string {
    if (!img) return 'assets/images/placeholder.svg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${environment.baseApi}${img}`;
  }
  getBannerImage(img: string): string {
    if (!img) return 'assets/images/placeholder-banner.jpg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${environment.baseApi}${img}`;
  }
  handleImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('placeholder.svg')) {
      img.src = 'assets/images/placeholder.svg';
    }
  }

  // ── Delivery Estimate ─────────────────────────────────────────────────────
  loadUserDeliveryDays(): void {
    const savedGovId = localStorage.getItem('selectedGovernorateId');
    if (!savedGovId) return;
    this.governorateService.getAll(true).subscribe({
      next: (res: any) => {
        if (res.success) {
          const gov = res.data.find((g: any) => g.id === +savedGovId);
          if (gov) {
            this.userDeliveryDays = gov.estimatedDeliveryDays || 3;
            this.cdr.detectChanges();
          }
        }
      }
    });
  }

  getDeliveryText(): string {
    if (!this.userDeliveryDays) return '';
    return this.i18n.currentLang === 'ar'
      ? `🚚 التوصيل خلال ${this.userDeliveryDays} أيام عمل`
      : `🚚 Delivery in ${this.userDeliveryDays} business days`;
  }

  getStars(rating: number): number[] { return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0); }
  getStarArray(rating: number): boolean[] { return Array(5).fill(false).map((_, i) => i < Math.round(rating)); }

  trackById(_: number, item: any): number { return item?.id ?? _; }
  trackByIndex(i: number): number { return i; }
}