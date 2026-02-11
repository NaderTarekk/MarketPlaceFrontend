import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CartItem } from '../../../../models/cart';
import { I18nService } from '../../../../core/services/i18n.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';
import { CreatePromoCode, PromoCode } from '../../../../models/promo-code';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;

  // Summary
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;

  // Promo Code
  promoCode = '';
  promoApplied = false;
  promoDiscount = 0;

  // Delete Dialog
  showDeleteDialog = false;
  itemToDelete: CartItem | null = null;
  isDeleting = false;

  // Clear Cart Dialog
  showClearDialog = false;
  isClearing = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  // promo code
  isAdmin = false;
  promoCodes: PromoCode[] = [];
  showPromoDialog = false;
  promoForm: CreatePromoCode = {
    code: '',
    type: 0,
    value: 0
  };
  isLoadingPromos = false;
  isSavingPromo = false;

  // Delete Promo Dialog
  showDeletePromoDialog = false;
  promoToDelete: PromoCode | null = null;
  isDeletingPromo = false;

  constructor(
    public i18n: I18nService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.isAdmin = localStorage.getItem('NHC_MP_Role') === 'Admin';

    this.loadCart();

    if (this.isAdmin) {
      this.loadPromoCodes();
    }
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartItems = res.data.items;
          this.calculateSummary();
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.showToast(this.t('error_loading'), 'error');
      }
    });
  }

  calculateSummary(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate discount from original prices
    this.discount = this.cartItems.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);

    // Shipping (free over 200)
    this.shipping = this.subtotal >= 200 ? 0 : 25;

    // Apply promo discount
    const promoAmount = this.promoApplied ? (this.subtotal * this.promoDiscount / 100) : 0;

    this.total = this.subtotal + this.shipping - promoAmount;
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.openDeleteDialog(item);
      return;
    }

    if (newQuantity > item.stock) {
      this.showToast(this.t('max_stock'), 'error');
      return;
    }

    item.quantity = newQuantity;
    this.calculateSummary();

    this.cartService.updateQuantity(item.productId, newQuantity).subscribe({
      next: (res) => {
        if (!res.success) {
          item.quantity = newQuantity - change; // Revert
          this.calculateSummary();
          this.showToast(res.message || this.t('error_updating'), 'error');
        }
      },
      error: () => {
        item.quantity = newQuantity - change; // Revert
        this.calculateSummary();
        this.showToast(this.t('error_updating'), 'error');
      }
    });
  }

  setQuantity(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    let newQuantity = parseInt(input.value) || 1;

    if (newQuantity <= 0) newQuantity = 1;
    if (newQuantity > item.stock) {
      newQuantity = item.stock;
      this.showToast(this.t('max_stock'), 'error');
    }

    item.quantity = newQuantity;
    input.value = newQuantity.toString();
    this.calculateSummary();

    this.cartService.updateQuantity(item.productId, newQuantity).subscribe({
      error: () => this.showToast(this.t('error_updating'), 'error')
    });
  }

  // Delete Item
  openDeleteDialog(item: CartItem): void {
    this.itemToDelete = item;
    this.showDeleteDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.itemToDelete = null;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    this.isDeleting = true;
    this.cartService.removeItem(this.itemToDelete.productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartItems = this.cartItems.filter(i => i.productId !== this.itemToDelete!.productId);
          this.calculateSummary();
          this.showToast(this.t('item_removed'), 'success');
          this.closeDeleteDialog();
        }
        this.isDeleting = false;
      },
      error: () => {
        this.isDeleting = false;
        this.showToast(this.t('error_deleting'), 'error');
      }
    });
  }

  // Clear Cart
  openClearDialog(): void {
    this.showClearDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeClearDialog(): void {
    this.showClearDialog = false;
    document.body.style.overflow = '';
  }

  confirmClear(): void {
    this.isClearing = true;
    this.cartService.clearCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cartItems = [];
          this.calculateSummary();
          this.showToast(this.t('cart_cleared'), 'success');
          this.closeClearDialog();
        }
        this.isClearing = false;
      },
      error: () => {
        this.isClearing = false;
        this.showToast(this.t('error_clearing'), 'error');
      }
    });
  }

  removePromoCode(): void {
    this.promoApplied = false;
    this.promoDiscount = 0;
    this.promoCode = '';
    this.calculateSummary();
  }

  // Checkout
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) return;
    this.router.navigate(['/checkout']);
  }

  // Helpers
  getName(item: CartItem): string {
    return this.i18n.currentLang === 'ar' ? item.productNameAr : item.productNameEn;
  }

  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ر.س' : 'SAR');
  }

  getDiscountPercentage(item: CartItem): number | null {
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

  trackByItem(index: number, item: CartItem): number {
    return item.productId;
  }

  // for promo code
  loadPromoCodes(): void {
    this.isLoadingPromos = true;
    this.cartService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.promoCodes = res.data;
        }
        this.isLoadingPromos = false;
      },
      error: () => {
        this.isLoadingPromos = false;
      }
    });
    this.cdr.detectChanges();
  }

  openPromoDialog(): void {
    this.promoForm = {
      code: '',
      type: 0,
      value: 0
    };
    this.showPromoDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closePromoDialog(): void {
    this.showPromoDialog = false;
    document.body.style.overflow = '';
  }

  deletePromoCode(id: number): void {
    if (!confirm(this.i18n.currentLang === 'ar' ? 'حذف هذا الكود؟' : 'Delete this code?')) return;

    this.cartService.delete(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('promo_deleted'), 'success');
          this.loadPromoCodes();
        }
      }
    });
  }

  togglePromoStatus(promo: PromoCode): void {
    this.cartService.update(promo.id, { isActive: !promo.isActive }).subscribe({
      next: (res) => {
        if (res.success) {
          promo.isActive = !promo.isActive;
        }
      }
    });
  }

  calculateSummaryWithPromo(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.discount = this.cartItems.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    this.shipping = this.subtotal >= 200 ? 0 : 25;
    this.total = this.subtotal + this.shipping - (this.promoApplied ? this.promoDiscount : 0);
  }

  openDeletePromoDialog(promo: PromoCode): void {
    this.promoToDelete = promo;
    this.showDeletePromoDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeletePromoDialog(): void {
    this.showDeletePromoDialog = false;
    this.promoToDelete = null;
    document.body.style.overflow = '';
  }

  confirmDeletePromo(): void {
    if (!this.promoToDelete) return;

    this.isDeletingPromo = true;
    this.cartService.delete(this.promoToDelete.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('promo_deleted'), 'success');
          this.loadPromoCodes();
          this.closeDeletePromoDialog();
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isDeletingPromo = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isDeletingPromo = false;
      }
    });
  }



















   applyPromoCode(): void {
    if (!this.promoCode.trim()) {
      this.showToast(this.t('enter_promo'), 'error');
      return;
    }

    this.cartService.validate(this.promoCode, this.subtotal).subscribe({
      next: (res) => {
        if (res.success && res.data.isValid) {
          this.promoApplied = true;
          this.promoDiscount = res.data.discountAmount; // المبلغ الفعلي للخصم
          this.calculateSummary();
          this.showToast(res.data.message || this.t('promo_applied'), 'success');
        } else {
          this.showToast(res.data?.message || this.t('invalid_promo'), 'error');
        }
      },
      error: (err) => {
        this.showToast(err.error?.message || this.t('invalid_promo'), 'error');
      }
    });
  }
  
  // إصلاح عرض الخصم في HTML
  getPromoDisplayValue(): string {
    return this.formatPrice(this.promoDiscount);
  }

  // إصلاح savePromoCode - التأكد من إرسال كل الحقول
  savePromoCode(): void {
    if (!this.promoForm.code || !this.promoForm.value) {
      this.showToast(this.t('fill_required'), 'error');
      return;
    }

    this.isSavingPromo = true;

    const data: CreatePromoCode = {
      code: this.promoForm.code.toUpperCase(),
      type: this.promoForm.type,
      value: this.promoForm.value,
      descriptionAr: this.promoForm.descriptionAr || undefined,
      descriptionEn: this.promoForm.descriptionEn || undefined,
      maxDiscount: this.promoForm.maxDiscount || undefined,
      minOrderAmount: this.promoForm.minOrderAmount || undefined,
      maxUsageCount: this.promoForm.maxUsageCount || undefined,
      maxUsagePerUser: this.promoForm.maxUsagePerUser || undefined,
      startDate: this.promoForm.startDate || undefined,
      endDate: this.promoForm.endDate || undefined
    };

    this.cartService.create(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('promo_created'), 'success');
          this.loadPromoCodes();
          this.closePromoDialog();
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isSavingPromo = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSavingPromo = false;
      }
    });
  }

  // تحسين عرض الـ type في HTML
  getPromoTypeDisplay(promo: PromoCode): string {
    if (promo.type === 'Percentage' || promo.type === '0') {
      return promo.value + '%';
    } else {
      return this.formatPrice(promo.value);
    }
  }

  // أضف الترجمات الناقصة
  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'حدث خطأ في التحميل', en: 'Error loading cart' },
      'error_updating': { ar: 'حدث خطأ في التحديث', en: 'Error updating cart' },
      'error_deleting': { ar: 'حدث خطأ في الحذف', en: 'Error removing item' },
      'error_clearing': { ar: 'حدث خطأ في تفريغ السلة', en: 'Error clearing cart' },
      'item_removed': { ar: 'تم حذف المنتج', en: 'Item removed' },
      'cart_cleared': { ar: 'تم تفريغ السلة', en: 'Cart cleared' },
      'max_stock': { ar: 'الكمية غير متوفرة', en: 'Quantity not available' },
      'invalid_promo': { ar: 'كود خاطئ أو منتهي', en: 'Invalid or expired code' },
      'enter_promo': { ar: 'أدخل كود الخصم', en: 'Enter promo code' },
      'fill_required': { ar: 'يرجى ملء الحقول المطلوبة', en: 'Please fill required fields' },
      'promo_created': { ar: 'تم إنشاء كود الخصم بنجاح', en: 'Promo code created successfully' },
      'promo_deleted': { ar: 'تم حذف كود الخصم', en: 'Promo code deleted' },
      'promo_applied': { ar: 'تم تطبيق الخصم بنجاح', en: 'Discount applied successfully' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }
}
