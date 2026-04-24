import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';
import { PromotionService } from '../../../../services/promotion.service';
import { CartService } from '../../../cart/services/cart.service';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-promotion-detail',
  standalone: false,
  templateUrl: './promotion-detail.component.html',
  styleUrl: './promotion-detail.component.css'
})
export class PromotionDetailComponent implements OnInit, OnDestroy {
  promotion: any = null;
  isLoading = true;
  promotionId = 0;

  // Filtered & sorted products
  filteredProducts: any[] = [];
  searchQuery = '';
  sortBy = 'default';
  priceFilter = 'all';

  // Countdown
  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownInterval: any;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.promotionId = id;
        this.loadPromotion(id);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  loadPromotion(id: number): void {
    this.isLoading = true;
    this.promotionService.getById(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.promotion = res.data;
          this.applyFilters();
          if (this.promotion.endDate) this.startCountdown();
        } else {
          this.router.navigate(['/']);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }

  // ─── Filters & Sort ───
  applyFilters(): void {
    if (!this.promotion?.products) { this.filteredProducts = []; return; }

    let products = [...this.promotion.products];

    // Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      products = products.filter((p: any) =>
        p.nameAr?.toLowerCase().includes(q) || p.nameEn?.toLowerCase().includes(q)
      );
    }

    // Price filter
    if (this.priceFilter === 'under100') products = products.filter((p: any) => p.price < 100);
    else if (this.priceFilter === 'under500') products = products.filter((p: any) => p.price < 500);
    else if (this.priceFilter === 'under1000') products = products.filter((p: any) => p.price < 1000);
    else if (this.priceFilter === 'above1000') products = products.filter((p: any) => p.price >= 1000);

    // Sort
    if (this.sortBy === 'priceLow') products.sort((a: any, b: any) => a.price - b.price);
    else if (this.sortBy === 'priceHigh') products.sort((a: any, b: any) => b.price - a.price);
    else if (this.sortBy === 'rating') products.sort((a: any, b: any) => b.rating - a.rating);
    else if (this.sortBy === 'discount') products.sort((a: any, b: any) => (this.getDiscountPercentage(b) || 0) - (this.getDiscountPercentage(a) || 0));

    this.filteredProducts = products;
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.applyFilters();
  }

  onPriceFilter(filter: string): void {
    this.priceFilter = filter;
    this.applyFilters();
  }

  // ─── Countdown ───
  startCountdown(): void {
    const update = () => {
      const end = new Date(this.promotion.endDate).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        clearInterval(this.countdownInterval);
        return;
      }
      this.countdown = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      };
      this.cdr.detectChanges();
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  // ─── Helpers ───
  getImageUrl(img: string): string {
    if (!img) return 'assets/images/placeholder.svg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${environment.baseApi}${img}`;
  }

  getName(item: any): string {
    return this.i18n.currentLang === 'ar' ? (item.nameAr || item.titleAr) : (item.nameEn || item.titleEn);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EGP';
  }

  getDiscountPercentage(product: any): number | null {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return null;
  }

  getSavedAmount(product: any): number {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(product.originalPrice - product.price);
    }
    return 0;
  }

  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5].map(s => s <= Math.round(rating) ? 1 : 0);
  }

  addToCart(product: any, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addItem(product.productId, 1, undefined, undefined, undefined, this.promotionId).subscribe({
      next: () => this.showToast(this.i18n.currentLang === 'ar' ? 'تم الإضافة للسلة' : 'Added to cart', 'success'),
      error: () => this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error', 'error')
    });
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => { this.toast.show = false; this.cdr.detectChanges(); }, 3000);
  }

  padZero(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }
}
