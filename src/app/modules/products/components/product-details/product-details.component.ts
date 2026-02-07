import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Product, ProductList } from '../../../../models/products';
import { I18nService } from '../../../../core/services/i18n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { environment } from '../../../../../environment';
import { AuthService } from '../../../auth/services/auth.service';
import { ReviewFilter, ReviewResponse } from '../../../../models/review';

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: ProductList[] = [];
  isLoading = true;

  filter: ReviewFilter = {
    isApproved: undefined,
    pageNumber: 1,
    pageSize: 10
  };

  pagination = {
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  };
  // Reviews
  reviews: ReviewResponse[] = [];
  isLoadingReviews = false;
  showReviewForm = false;
  reviewForm = { rating: 5, comment: '' };
  isSubmittingReview = false;
  hoveredRating = 0;
  // Gallery
  selectedImage: string = '';
  currentImageIndex = 0;

  // Quantity
  quantity = 1;

  // Tabs
  activeTab: 'description' | 'specs' | 'reviews' = 'description';

  // Wishlist
  isInWishlist = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.product = res.data;
          this.selectedImage = this.getImageUrl(this.product.mainImage);
          this.loadRelatedProducts(id);
          this.checkWishlist(id);
          this.loadReviews(id);
        } else {
          this.router.navigate(['/products']);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  loadReviews(productId: number): void {
    this.isLoadingReviews = true;
    this.productService.getProductReviews(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.data;
        }
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingReviews = false;
      }
    });
  }

  openReviewForm(): void {
    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showReviewForm = true;
    this.reviewForm = { rating: 5, comment: '' };
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.reviewForm = { rating: 5, comment: '' };
  }

  setRating(rating: number): void {
    this.reviewForm.rating = rating;
  }

  submitReview(): void {
    if (!this.product) return;
    if (!this.reviewForm.comment.trim()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يرجى كتابة تعليق' : 'Please write a comment',
        'error'
      );
      return;
    }

    this.isSubmittingReview = true;
    this.productService.createReview({
      productId: this.product.id,
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'تم إرسال التقييم وسيظهر بعد الموافقة' : 'Review submitted and pending approval',
            'success'
          );
          this.closeReviewForm();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmittingReview = false;
        this.cdr.markForCheck();

      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmittingReview = false;
      }
    });
    this.cdr.markForCheck();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  checkWishlist(productId: number): void {
    if (this.authService.isLoggedIn()) {
      this.productService.isInWishlist(productId).subscribe({
        next: (res) => {
          if (res.success) {
            this.isInWishlist = res.data;
            this.cdr.markForCheck();
          }
        }
      });
    }
  }

  toggleWishlist(): void {
    if (!this.product) return;

    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    this.productService.toggle(this.product.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.isInWishlist = !this.isInWishlist;
          this.showToast(
            this.isInWishlist
              ? (this.i18n.currentLang === 'ar' ? 'تم إضافته للمفضلة' : 'Added to wishlist')
              : (this.i18n.currentLang === 'ar' ? 'تم إزالته من المفضلة' : 'Removed from wishlist'),
            'success'
          );
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred',
          'error'
        );
      }
    });
  }

  loadRelatedProducts(productId: number): void {
    this.productService.getRelated(productId, 4).subscribe({
      next: (res) => {
        if (res.success) {
          this.relatedProducts = res.data;
        }
      }
    });
  }

  // ═══════════════════════════════════════════════
  // GALLERY
  // ═══════════════════════════════════════════════

  get allImages(): string[] {
    if (!this.product) return [];
    const images = [this.product.mainImage, ...(this.product.images || [])];
    return images.filter(img => img);
  }

  selectImage(image: string, index: number): void {
    this.selectedImage = this.getImageUrl(image);
    this.currentImageIndex = index;
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.selectedImage = this.getImageUrl(this.allImages[this.currentImageIndex]);
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.allImages.length - 1) {
      this.currentImageIndex++;
      this.selectedImage = this.getImageUrl(this.allImages[this.currentImageIndex]);
    }
  }

  // ═══════════════════════════════════════════════
  // QUANTITY
  // ═══════════════════════════════════════════════

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  // ═══════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════

  addToCart(): void {
    if (!this.product) return;
    // TODO: Implement cart service
    this.showToast(
      this.i18n.currentLang === 'ar' ? 'تم إضافة المنتج للسلة' : 'Product added to cart',
      'success'
    );
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  shareProduct(): void {
    if (navigator.share) {
      navigator.share({
        title: this.getName(this.product),
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'تم نسخ الرابط' : 'Link copied',
        'success'
      );
    }
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  getName(item: any): string {
    if (!item) return '';
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  getDescription(): string {
    if (!this.product) return '';
    return this.i18n.currentLang === 'ar'
      ? (this.product.descriptionAr || '')
      : (this.product.descriptionEn || '');
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ر.س' : 'SAR');
  }

  getDiscountPercentage(): number | null {
    if (!this.product || !this.product.originalPrice) return null;
    if (this.product.originalPrice <= this.product.price) return null;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };

    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

}
