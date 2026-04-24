import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Product, ProductList } from '../../../../models/products';
import { I18nService } from '../../../../core/services/i18n.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { environment } from '../../../../../environment';
import { AuthService } from '../../../auth/services/auth.service';
import { GovernorateService } from '../../../adamin/services/governorate.service';
import { Governorate } from '../../../../models/governorate';
import { ReviewFilter, ReviewResponse } from '../../../../models/review';
import { CartService } from '../../../cart/services/cart.service';
import { ComplaintsService } from '../../../complaints/services/complaints.service';
import { ToastrComponent } from '../../../../shared/components/toastr/toastr.component';
import { ToastrService } from 'ngx-toastr';
import { PromotionService } from '../../../../services/promotion.service';

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
  selectedSize?: string;
  selectedColor?: string;
  selectedVariant?: any;
  quantity: number = 1;
  promoId: number | null = null;
  promoDiscount: number = 0;

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
  showVideo = false;

  // Delivery Estimate
  governorates: Governorate[] = [];
  selectedGovernorateId: number | null = null;
  deliveryEstimate: { from: string; to: string; days: number } | null = null;

  // Complaint
  showComplaintForm = false;
  complaintForm = {
    title: '',
    type: 1,
    description: ''
  };
  isSubmittingComplaint = false;

  // Tabs
  activeTab: 'description' | 'specs' | 'reviews' = 'description';

  // Wishlist
  isInWishlist = false;

  // Notify
  isNotifyRequested = false;
  isSubmittingNotify = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductsService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private cartService: CartService,
    private complaintsService: ComplaintsService,
    private toastr: ToastrService,
    private governorateService: GovernorateService,
    private promotionService: PromotionService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(qp => {
      this.promoId = qp['promoId'] ? +qp['promoId'] : null;
    });
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
    this.loadGovernorates();
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
          this.checkNotifySubscription(id);
          this.loadReviews(id);
          if (this.promoId) this.loadPromoDiscount(this.promoId, id);
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

  // لما اليوزر يختار size
  onSizeSelect(size: string) {
    this.selectedSize = size;
    this.updateSelectedVariant();
  }

  // لما اليوزر يختار color
  onColorSelect(color: string) {
    this.selectedColor = color;
    this.updateSelectedVariant();
  }

  // دور على الـ variant المناسب
  updateSelectedVariant() {
    if (this.product?.hasVariants && this.product?.variants) {
      this.selectedVariant = this.product.variants.find((v: any) =>
        v.size === this.selectedSize && v.color === this.selectedColor
      );
    }
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

  openComplaintForm(): void {
    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showComplaintForm = true;
    this.complaintForm = {
      title: '',
      type: 1,
      description: ''
    };
  }

  submitComplaint(): void {
    if (!this.product) return;

    if (!this.complaintForm.title.trim()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يرجى كتابة العنوان' : 'Please write a title',
        'error'
      );
      return;
    }

    if (!this.complaintForm.description.trim()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يرجى كتابة الشكوى' : 'Please write your complaint',
        'error'
      );
      return;
    }

    this.isSubmittingComplaint = true;

    this.complaintsService.createComplaint({
      title: this.complaintForm.title,
      type: this.complaintForm.type,
      productId: this.product.id,
      description: this.complaintForm.description
    }).subscribe({
      next: (res) => {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'تم إرسال الشكوى بنجاح' : 'Complaint submitted successfully',
          'success'
        );
        this.closeComplaintForm();
        this.isSubmittingComplaint = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmittingComplaint = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeComplaintForm(): void {
    this.showComplaintForm = false;
    this.complaintForm = { title: '', type: 1, description: '' };
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
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
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

  loadPromoDiscount(promoId: number, productId: number): void {
    this.promotionService.getById(promoId).subscribe({
      next: (res: any) => {
        if (res.success && res.data.discountPercentage > 0) {
          const promo = res.data;
          const productInPromo = promo.products?.some((p: any) => p.productId === productId);
          if (productInPromo || promo.type === 2) {
            this.promoDiscount = promo.discountPercentage;
            this.cdr.markForCheck();
          }
        }
      }
    });
  }

  getPromoPrice(): number {
    if (!this.product || this.promoDiscount <= 0) return 0;
    return Math.round(this.product.price * (1 - this.promoDiscount / 100));
  }

  addToCart(): void {
  if (!this.product) return;

  if (!this.authService.isLoggedIn()) {
    this.showToast(
      this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
      'error'
    );
    this.router.navigate(['/auth/login']);
    return;
  }

  // تحقق من الـ variants
  if (this.product.hasVariants && (!this.selectedSize || !this.selectedColor)) {
    this.showToast(
      this.i18n.currentLang === 'ar' ? 'يرجى اختيار المقاس واللون' : 'Please select size and color',
      'error'
    );
    return;
  }

  // ✅ حساب فرق السعر
  const priceAdjustment = this.selectedVariant?.priceAdjustment || 0;

  this.cartService.addItem(
    this.product.id,
    this.quantity,
    this.selectedSize,
    this.selectedColor,
    priceAdjustment,
    this.promoId || undefined
  ).subscribe({
    next: (res) => {
      if (res.success) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'تم إضافة المنتج للسلة' : 'Product added to cart',
          'success'
        );
      } else {
        this.toastr.error(res.message);
      }
    },
    error: (err) => {
      this.showToast(err.error?.message || 'Error', 'error');
    }
  });
}


  buyNow(): void {
    if (!this.product) return;

    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    // تحقق من الـ variants
    if (this.product.hasVariants && (!this.selectedSize || !this.selectedColor)) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يرجى اختيار المقاس واللون' : 'Please select size and color',
        'error'
      );
      return;
    }

    this.cartService.addItem(this.product.id, this.quantity).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/cart']);
        }
      }
    });
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
    if (!image) return 'assets/images/placeholder.svg';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
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

  // ═══════════════════════════════════════════════
  // DELIVERY ESTIMATE
  // ═══════════════════════════════════════════════

  loadGovernorates(): void {
    this.governorateService.getAll(true).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.governorates = res.data;
          // Auto-select if user has a saved address
          this.autoSelectGovernorate();
        }
      }
    });
  }

  autoSelectGovernorate(): void {
    const savedGovId = localStorage.getItem('selectedGovernorateId');
    if (savedGovId) {
      this.selectedGovernorateId = +savedGovId;
      this.calculateDeliveryEstimate();
    } else {
      this.detectUserLocation();
    }
  }

  isDetectingLocation = false;

  detectUserLocation(): void {
    if (!navigator.geolocation) return;
    this.isDetectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`)
          .then(r => r.json())
          .then(data => {
            const state = data.address?.state || data.address?.governorate || data.address?.city || '';
            this.matchGovernorate(state);
            this.isDetectingLocation = false;
            this.cdr.detectChanges();
          })
          .catch(() => { this.isDetectingLocation = false; this.cdr.detectChanges(); });
      },
      () => { this.isDetectingLocation = false; this.cdr.detectChanges(); },
      { timeout: 5000 }
    );
  }

  private matchGovernorate(locationName: string): void {
    if (!locationName || !this.governorates.length) return;
    const name = locationName.toLowerCase().replace(/governorate|محافظة/gi, '').trim();

    const gov = this.governorates.find(g =>
      g.nameEn.toLowerCase().includes(name) ||
      name.includes(g.nameEn.toLowerCase()) ||
      g.nameAr.includes(name) ||
      name.includes(g.nameAr)
    );

    if (gov) {
      this.selectedGovernorateId = gov.id;
      localStorage.setItem('selectedGovernorateId', String(gov.id));
      this.calculateDeliveryEstimate();
    }
  }

  onGovernorateChange(govId: number): void {
    this.selectedGovernorateId = govId;
    localStorage.setItem('selectedGovernorateId', String(govId));
    this.calculateDeliveryEstimate();
  }

  calculateDeliveryEstimate(): void {
    if (!this.selectedGovernorateId) {
      this.deliveryEstimate = null;
      return;
    }
    const gov = this.governorates.find(g => g.id === this.selectedGovernorateId);
    if (!gov) return;

    const days = gov.estimatedDeliveryDays || 3;
    const fromDate = this.addBusinessDays(new Date(), Math.max(1, days - 1));
    const toDate = this.addBusinessDays(new Date(), days + 1);

    this.deliveryEstimate = {
      from: this.formatDeliveryDate(fromDate),
      to: this.formatDeliveryDate(toDate),
      days
    };
    this.cdr.detectChanges();
  }

  private addBusinessDays(start: Date, days: number): Date {
    const result = new Date(start);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 5) { // skip Friday
        added++;
      }
    }
    return result;
  }

  private formatDeliveryDate(date: Date): string {
    const lang = this.i18n.currentLang;
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getSelectedGovernorateName(): string {
    const gov = this.governorates.find(g => g.id === this.selectedGovernorateId);
    if (!gov) return '';
    return this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
  }

  checkNotifySubscription(productId: number): void {
    if (this.authService.isLoggedIn()) {
      this.productService.checkNotifySubscription(productId).subscribe({
        next: (res) => {
          if (res.success) {
            this.isNotifyRequested = res.data;
            this.cdr.markForCheck();
          }
        }
      });
    }
  }

  notifyWhenAvailable(): void {
    if (!this.product) return;

    if (!this.authService.isLoggedIn()) {
      this.showToast(
        this.i18n.currentLang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first',
        'error'
      );
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSubmittingNotify = true;
    this.productService.notifyWhenAvailable(this.product.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.isNotifyRequested = true;
          this.showToast(
            this.i18n.currentLang === 'ar'
              ? 'سيتم إبلاغك عند توفر المنتج'
              : 'You will be notified when this product is available',
            'success'
          );
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmittingNotify = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(
          err.error?.message || (this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred'),
          'error'
        );
        this.isSubmittingNotify = false;
        this.cdr.detectChanges();
      }
    });
  }
}
