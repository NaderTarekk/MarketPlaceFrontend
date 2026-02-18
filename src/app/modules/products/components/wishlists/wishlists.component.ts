import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';
import { ProductsService } from '../../services/products.service';
import { AuthService } from '../../../auth/services/auth.service';
import { environment } from '../../../../../environment';
import { WishlistItem } from '../../../../models/wishlistItem';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlists.component.html',
  styleUrl: './wishlists.component.css'
})
export class WishlistsComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  filteredItems: WishlistItem[] = [];
  isLoading = true;

  // Filters
  searchQuery = '';
  selectedSort = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  showMobileFilters = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // Sort Options
  sortOptions = [
    { value: 'newest', label: { ar: 'الأحدث', en: 'Newest' } },
    { value: 'oldest', label: { ar: 'الأقدم', en: 'Oldest' } },
    { value: 'price-low', label: { ar: 'السعر: الأقل', en: 'Price: Low' } },
    { value: 'price-high', label: { ar: 'السعر: الأعلى', en: 'Price: High' } },
    { value: 'name', label: { ar: 'الاسم', en: 'Name' } }
  ];

  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.productService.getWishlist().subscribe({
      next: (res) => {
        if (res.success) {
          this.wishlistItems = res.data;
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error');
      }
    });
  }

  applyFilters(): void {
    let items = [...this.wishlistItems];

    // Search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.productNameAr?.toLowerCase().includes(query) ||
        item.productNameEn?.toLowerCase().includes(query)
      );
    }

    // Price Range
    if (this.minPrice !== null) {
      items = items.filter(item => item.price >= this.minPrice!);
    }
    if (this.maxPrice !== null) {
      items = items.filter(item => item.price <= this.maxPrice!);
    }

    // In Stock
    if (this.inStockOnly) {
      items = items.filter(item => item.stock > 0);
    }

    // Sort
    switch (this.selectedSort) {
      case 'newest':
        items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'oldest':
        items.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'price-low':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        items.sort((a, b) => {
          const nameA = this.i18n.currentLang === 'ar' ? a.productNameAr : a.productNameEn;
          const nameB = this.i18n.currentLang === 'ar' ? b.productNameAr : b.productNameEn;
          return nameA.localeCompare(nameB);
        });
        break;
    }

    this.filteredItems = items;
  }

  removeFromWishlist(productId: number): void {
    this.productService.removeItem(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);
          this.applyFilters();
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم الإزالة من المفضلة' : 'Removed from wishlist',
            'success'
          );
        }
      },
      error: () => {
        this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error');
      }
    });
  }

  clearAllWishlist(): void {
    if (!confirm(this.i18n.currentLang === 'ar' ? 'هل تريد مسح كل المفضلة؟' : 'Clear all wishlist items?')) {
      return;
    }

    const removePromises = this.wishlistItems.map(item =>
      this.productService.removeItem(item.productId).toPromise()
    );

    Promise.all(removePromises).then(() => {
      this.wishlistItems = [];
      this.filteredItems = [];
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'تم مسح المفضلة' : 'Wishlist cleared',
        'success'
      );
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPriceFilter(): void {
    this.applyFilters();
  }

  onStockFilter(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.selectedSort = 'newest';
    this.applyFilters();
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
    document.body.style.overflow = this.showMobileFilters ? 'hidden' : '';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.minPrice || this.maxPrice) count++;
    if (this.inStockOnly) count++;
    return count;
  }

  // Helpers
  getName(item: WishlistItem): string {
    return this.i18n.currentLang === 'ar' ? item.productNameAr : item.productNameEn;
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  getDiscountPercentage(item: WishlistItem): number | null {
    if (!item.originalPrice || item.originalPrice <= item.price) return null;
    return Math.round((1 - item.price / item.originalPrice) * 100);
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
   setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  trackByItem(index: number, item: WishlistItem): number {
    return item.productId;
  }
}