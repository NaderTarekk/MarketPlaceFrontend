import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';
import { I18nService } from '../../../../core/services/i18n.service';
import { ReviewResponse } from '../../../../models/review';
import { AuthService } from '../../../auth/services/auth.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-my-reviews',
  standalone: false,
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.css',
})
export class MyReviewsComponent implements OnInit {
  reviews: ReviewResponse[] = [];
  filteredReviews: ReviewResponse[] = [];
  isLoading = true;

  // Filters
  selectedFilter: 'all' | 'approved' | 'pending' = 'all';
  selectedSort = 'newest';

  // Stats
  stats = {
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0
  };

  // Delete Dialog
  showDeleteDialog = false;
  reviewToDelete: ReviewResponse | null = null;
  isDeleting = false;

  // Edit Dialog
  showEditDialog = false;
  editingReview: ReviewResponse | null = null;
  editForm = { rating: 0, comment: '' };
  hoveredRating = 0;
  isUpdating = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;
    this.productService.getMyReviews().subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.data;
          this.calculateStats();
          this.applyFilters();
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

  calculateStats(): void {
    this.stats.total = this.reviews.length;
    this.stats.approved = this.reviews.filter(r => r.isApproved).length;
    this.stats.pending = this.reviews.filter(r => !r.isApproved).length;

    if (this.reviews.length > 0) {
      const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
      this.stats.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    }
  }

  applyFilters(): void {
    let filtered = [...this.reviews];

    // Status Filter
    if (this.selectedFilter === 'approved') {
      filtered = filtered.filter(r => r.isApproved);
    } else if (this.selectedFilter === 'pending') {
      filtered = filtered.filter(r => !r.isApproved);
    }

    // Sort
    switch (this.selectedSort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    this.filteredReviews = filtered;
  }

  onFilterChange(filter: 'all' | 'approved' | 'pending'): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  // Edit
  openEditDialog(review: ReviewResponse): void {
    this.editingReview = review;
    this.editForm = {
      rating: review.rating,
      comment: review.comment
    };
    this.showEditDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingReview = null;
    document.body.style.overflow = '';
  }

  setRating(rating: number): void {
    this.editForm.rating = rating;
  }

  updateReview(): void {
    if (!this.editingReview || !this.editForm.comment.trim()) return;

    this.isUpdating = true;
    this.productService.updateReview(this.editingReview.id, {
      rating: this.editForm.rating,
      comment: this.editForm.comment
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('review_updated'), 'success');
          this.loadReviews();
          this.closeEditDialog();
        } else {
          this.showToast(res.message || this.t('error_updating'), 'error');
        }
        this.isUpdating = false;
      },
      error: () => {
        this.isUpdating = false;
        this.showToast(this.t('error_updating'), 'error');
      }
    });
  }

  // Delete
  openDeleteDialog(review: ReviewResponse): void {
    this.reviewToDelete = review;
    this.showDeleteDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.reviewToDelete = null;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.reviewToDelete) return;

    this.isDeleting = true;
    this.productService.deleteReview(this.reviewToDelete.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = this.reviews.filter(r => r.id !== this.reviewToDelete!.id);
          this.calculateStats();
          this.applyFilters();
          this.showToast(this.t('review_deleted'), 'success');
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

  // Helpers
  getProductName(review: ReviewResponse): string {
    return this.i18n.currentLang === 'ar' ? review.productNameAr || '' : review.productNameEn || '';
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/images/placeholder.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(
      this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  }

  goToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'حدث خطأ في التحميل', en: 'Error loading reviews' },
      'error_updating': { ar: 'حدث خطأ في التحديث', en: 'Error updating review' },
      'error_deleting': { ar: 'حدث خطأ في الحذف', en: 'Error deleting review' },
      'review_updated': { ar: 'تم تحديث التقييم', en: 'Review updated' },
      'review_deleted': { ar: 'تم حذف التقييم', en: 'Review deleted' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }

  trackByReview(index: number, review: ReviewResponse): number {
    return review.id;
  }
}
