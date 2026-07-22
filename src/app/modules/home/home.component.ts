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
import { PromotionService } from '../../services/promotion.service';
import { PushService } from '../../services/push.service';

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
  storeSearchResults: any[] = [];
  allStores: any[] = [];
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

  // ── Promotions ─────────────────────────────────────────────────────────────
  activePromotions: any[] = [];

  // ── Welcome Popup ──────────────────────────────────────────────────────────
  showWelcomePopup = false;
  hideWelcomePopup = false;

  // ── Newsletter ─────────────────────────────────────────────────────────────
  newsletterEmail = '';
  isSubscribing = false;

  // ── Timers ─────────────────────────────────────────────────────────────────
  private bannerTimer: any = null;
  private statTimers: any[] = [];

  // Push notifications
  showPushPrompt = false;

  constructor(
    public i18n: I18nService,
    private router: Router,
    private homeService: HomeService,
    private productsService: ProductsService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private governorateService: GovernorateService,
    private promotionService: PromotionService,
    private pushService: PushService
  ) {}

  initPushPrompt(): void {
    if (!this.pushService.isSupported()) return;
    if (!localStorage.getItem('NHC_MP_Token')) return; // Only logged in users
    if (localStorage.getItem('push_subscribed') === '1') return;
    if (this.pushService.hasDismissedPrompt()) return;
    if (this.pushService.getPermission() === 'granted') {
      this.pushService.subscribe();
      return;
    }
    if (this.pushService.getPermission() === 'denied') return;

    // Show prompt after 5 seconds
    setTimeout(() => {
      this.showPushPrompt = true;
      this.cdr.detectChanges();
    }, 5000);
  }

  async acceptPush(): Promise<void> {
    this.showPushPrompt = false;
    const ok = await this.pushService.subscribe();
    if (!ok) {
      console.warn('Push subscription failed');
    }
    this.cdr.detectChanges();
  }

  dismissPush(): void {
    this.showPushPrompt = false;
    this.pushService.dismissPrompt();
    this.cdr.detectChanges();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════ Flash Sale Countdown ══════════════
  flashSaleCountdown: { hours: string; minutes: string; seconds: string } | null = null;
  private flashSaleTimer: any;
  private flashSaleEndsAt: number = 0;

  // ══════════════ Scroll Progress ══════════════
  scrollProgress = 0;

  // ══════════════ Live Sales Ticker ══════════════
  liveTickerMessages: string[] = [];
  currentTickerIndex = 0;
  private tickerTimer: any;

  // ══════════════ Recently Viewed ══════════════
  recentlyViewed: any[] = [];

  // ══════════════ Trending Stats ══════════════
  statsCounters = { customers: 0, products: 0, vendors: 0, orders: 0 };
  private statsTargets = { customers: 12480, products: 3250, vendors: 148, orders: 45820 };
  private statsAnimated = false;

  private animateTrendingStats(): void {
    if (this.statsAnimated) return;
    this.statsAnimated = true;
    const duration = 1600;
    const start = performance.now();
    const step = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.statsCounters = {
        customers: Math.floor(this.statsTargets.customers * ease),
        products: Math.floor(this.statsTargets.products * ease),
        vendors: Math.floor(this.statsTargets.vendors * ease),
        orders: Math.floor(this.statsTargets.orders * ease)
      };
      this.cdr.markForCheck();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ══════════════ Hero Typing Animation ══════════════
  typingText = '';
  private typingPhrasesAr = ['أفضل العروض 🔥', 'أسعار مذهلة 💰', 'تجار موثوقون ✨', 'شحن سريع 🚚', 'جودة عالية ⭐'];
  private typingPhrasesEn = ['Amazing Deals 🔥', 'Best Prices 💰', 'Trusted Vendors ✨', 'Fast Shipping 🚚', 'Top Quality ⭐'];
  private typingTimer: any;

  private setupTypingAnimation(): void {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const tick = () => {
      const phrases = this.i18n.currentLang === 'ar' ? this.typingPhrasesAr : this.typingPhrasesEn;
      const current = phrases[phraseIdx % phrases.length];
      if (!deleting) {
        charIdx++;
        this.typingText = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          deleting = true;
          this.cdr.markForCheck();
          this.typingTimer = setTimeout(tick, 1500);
          return;
        }
      } else {
        charIdx--;
        this.typingText = current.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          phraseIdx++;
        }
      }
      this.cdr.markForCheck();
      this.typingTimer = setTimeout(tick, deleting ? 45 : 90);
    };
    this.typingTimer = setTimeout(tick, 400);
  }

  // ══════════════ Wishlist Preview ══════════════
  wishlistPreview: any[] = [];
  showWishlistPreview = false;

  private loadWishlistPreview(): void {
    this.productsService.getWishlist().subscribe({
      next: (res: any) => this.ngZone.run(() => {
        const items = (res?.data || []).slice(0, 4).map((w: any) => ({
          id: w.productId,
          mainImage: w.productImage,
          nameAr: w.productNameAr,
          nameEn: w.productNameEn,
          price: w.price
        }));
        this.wishlistPreview = items;
        this.cdr.markForCheck();
      }),
      error: () => this.ngZone.run(() => { this.wishlistPreview = []; this.cdr.markForCheck(); })
    });
  }

  toggleWishlistPreview(): void {
    this.showWishlistPreview = !this.showWishlistPreview;
    if (this.showWishlistPreview) this.loadWishlistPreview();
  }

  // ══════════════ New Arrivals detection ══════════════
  isNewArrival(product: any): boolean {
    if (!product?.createdAt && !product?.createdOn) return false;
    const created = new Date(product.createdAt || product.createdOn).getTime();
    const week = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - created) < week;
  }

  // ══════════════ Sticky Continue Shopping ══════════════
  showContinueShopping = false;

  private setupContinueShopping(): void {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // show when scrolled significantly + user is scrolling down
      if (y > 800 && y > lastY && !this.showContinueShopping) {
        this.showContinueShopping = true;
        this.cdr.markForCheck();
      }
      lastY = y;
    }, { passive: true });
  }

  dismissContinueShopping(): void {
    this.showContinueShopping = false;
  }

  private setupScrollProgress(): void {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.scrollProgress = Math.min(100, Math.max(0, progress));
      this.cdr.markForCheck();
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  private setupLiveTicker(): void {
    const names = ['أحمد', 'محمد', 'سارة', 'يوسف', 'ندى', 'عمر', 'رنا', 'خالد', 'مي', 'حسن'];
    const namesEn = ['Ahmed', 'Mohamed', 'Sara', 'Yousef', 'Nada', 'Omar', 'Rana', 'Khaled', 'Mai', 'Hassan'];
    const cities = ['القاهرة', 'الاسكندرية', 'الجيزة', 'المنصورة', 'طنطا', 'أسيوط'];
    const citiesEn = ['Cairo', 'Alex', 'Giza', 'Mansoura', 'Tanta', 'Assiut'];
    const build = () => {
      const isAr = this.i18n.currentLang === 'ar';
      const list = isAr ? names : namesEn;
      const cityList = isAr ? cities : citiesEn;
      const msgs: string[] = [];
      for (let i = 0; i < 6; i++) {
        const n = list[Math.floor(Math.random() * list.length)];
        const c = cityList[Math.floor(Math.random() * cityList.length)];
        const mins = Math.floor(Math.random() * 30) + 1;
        msgs.push(isAr
          ? `${n} من ${c} اشترى منتجاً منذ ${mins} دقيقة`
          : `${n} from ${c} bought a product ${mins} min ago`
        );
      }
      this.liveTickerMessages = msgs;
    };
    build();
    this.tickerTimer = setInterval(() => {
      this.currentTickerIndex = (this.currentTickerIndex + 1) % this.liveTickerMessages.length;
      this.cdr.markForCheck();
    }, 4000);
  }

  getCategoryIcon(idx: number): string {
    const icons = ['fa-shirt', 'fa-mobile-screen', 'fa-house-chimney', 'fa-gamepad', 'fa-book', 'fa-baby', 'fa-shoe-prints', 'fa-headphones', 'fa-car', 'fa-utensils', 'fa-paw', 'fa-dumbbell'];
    return icons[idx % icons.length];
  }

  private loadRecentlyViewed(): void {
    try {
      const ids: number[] = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      if (!ids.length) return;
      // Reuse topSelling or best sellers to hydrate; fallback empty
      const products = (this as any).topSellingProducts || [];
      this.recentlyViewed = ids
        .map(id => products.find((p: any) => p.id === id))
        .filter(Boolean)
        .slice(0, 8);
    } catch { }
  }

  private startFlashSaleCountdown(): void {
    // 24-hour rolling flash sale (resets when it ends)
    const now = Date.now();
    if (!this.flashSaleEndsAt || this.flashSaleEndsAt < now) {
      this.flashSaleEndsAt = now + 24 * 60 * 60 * 1000;
    }
    const update = () => {
      const diff = Math.max(0, this.flashSaleEndsAt - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      this.flashSaleCountdown = {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      };
      this.cdr.markForCheck();
    };
    update();
    this.flashSaleTimer = setInterval(update, 1000);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadBanners();
    this.loadTopSellingProducts();
    this.loadUserDeliveryDays();
    this.triggerWelcomePopup();
    this.pushService.init();
    this.initPushPrompt();
    this.loadPromotions();
    this.productsService.getStores().subscribe({
      next: (res: any) => { if (res.success) this.allStores = res.data || []; },
      error: () => {}
    });
    // this.loadFeaturedSections();
    this.isLoadingSections = false;
    this.loadStats();
    this.loadTestimonials();
    this.setupSearch();
    this.startBannerAutoplay();
    this.startFlashSaleCountdown();
    this.setupScrollProgress();
    this.setupLiveTicker();
    this.setupContinueShopping();
    this.setupTypingAnimation();
    setTimeout(() => { this.loadRecentlyViewed(); this.animateTrendingStats(); }, 1000);
  }

  ngOnDestroy(): void {
    if (this.bannerTimer) clearInterval(this.bannerTimer);
    if (this.flashSaleTimer) clearInterval(this.flashSaleTimer);
    if (this.tickerTimer) clearInterval(this.tickerTimer);
    if (this.typingTimer) clearTimeout(this.typingTimer);
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

  // ── Touch swipe ──
  private touchStartX = 0;

  onBannerTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  onBannerTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.nextBanner() : this.prevBanner();
    }
  }

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
          this.searchResults = res.data.slice(0, 5);
          const q = this.searchQuery.toLowerCase();
          this.storeSearchResults = this.allStores.filter((s: any) =>
            s.vendorName?.toLowerCase().includes(q)
          ).slice(0, 3);
          this.showSearchDropdown = this.searchResults.length > 0 || this.storeSearchResults.length > 0 || this.searchQuery.length >= 2;
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
    this.showSearchDropdown = false; this.searchQuery = ''; this.searchResults = []; this.storeSearchResults = [];
    this.router.navigate(['/products', p.id]);
  }
  goToStore(store: any): void {
    this.showSearchDropdown = false; this.searchQuery = ''; this.searchResults = []; this.storeSearchResults = [];
    this.router.navigate(['/products'], { queryParams: { vendorId: store.vendorId, storeName: store.vendorName } });
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

  getBannerLink(b: any): string {
    switch (b.linkType) {
      case 1: return '/products/' + (b.linkTargetId || '');
      case 2: return '/products';
      case 3: return '/products';
      case 4: return '/products/promotion/' + (b.linkTargetId || '');
      default: return b.buttonLink || '/products';
    }
  }

  getBannerQueryParams(b: any): any {
    switch (b.linkType) {
      case 2: return { brand: b.linkTargetId };
      case 3: return { category: b.linkTargetId };
      default: return {};
    }
  }

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
  loadPromotions(): void {
    this.promotionService.getAll(true).subscribe({
      next: (res: any) => {
        if (res.success) this.activePromotions = res.data;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  triggerWelcomePopup(): void {
    const lastShown = localStorage.getItem('welcomePopupShown');
    const now = Date.now();
    // Show once per session (or every 24h)
    if (lastShown && now - +lastShown < 24 * 60 * 60 * 1000) return;

    setTimeout(() => {
      this.showWelcomePopup = true;
      this.cdr.detectChanges();

      // Auto hide after 3 seconds
      setTimeout(() => {
        this.hideWelcomePopup = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showWelcomePopup = false;
          this.hideWelcomePopup = false;
          this.cdr.detectChanges();
        }, 500);
      }, 3000);

      localStorage.setItem('welcomePopupShown', String(now));
    }, 800);
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