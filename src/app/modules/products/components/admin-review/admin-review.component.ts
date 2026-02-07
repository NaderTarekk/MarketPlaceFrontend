// admin-reviews.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';
import { ReviewFilter, ReviewResponse } from '../../../../models/review';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-reviews',
  standalone: false,
  templateUrl: './admin-review.component.html',
  styleUrls: ['./admin-review.component.css']
})
export class AdminReviewComponent implements OnInit {
  reviews: ReviewResponse[] = [];
  isLoading = false;
  isSubmitting = false;

  // Dialog states
  showApproveDialog = false;
  showRejectDialog = false;
  selectedReview: ReviewResponse | null = null;

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

  constructor(
    private productService: ProductsService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;

    this.productService.getAllReviews(this.filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.reviews = res.data || [];
          this.pagination = res.pagination || this.pagination;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterByStatus(status: 'all' | 'approved' | 'pending'): void {
    this.filter.isApproved = status === 'all' ? undefined : status === 'approved';
    this.filter.pageNumber = 1;
    this.loadReviews();
    this.cdr.detectChanges();
  }

  // Open approve dialog
  openApproveDialog(review: ReviewResponse): void {
    this.selectedReview = review;
    this.showApproveDialog = true;
  }

  // Open reject dialog
  openRejectDialog(review: ReviewResponse): void {
    this.selectedReview = review;
    this.showRejectDialog = true;
  }

  // Confirm approve
  confirmApprove(): void {
    if (!this.selectedReview) return;

    this.isSubmitting = true;
    this.productService.approveReview(this.selectedReview.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadReviews();
          this.closeAllDialogs();
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Approve error:', err);
        this.isSubmitting = false;
      }
    });
    this.cdr.markForCheck();
  }

  // Confirm reject
  confirmReject(): void {
    if (!this.selectedReview) return;

    this.isSubmitting = true;
    this.productService.rejectReview(this.selectedReview.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadReviews();
          this.closeAllDialogs();
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Reject error:', err);
        this.isSubmitting = false;
      }
    });
  }

  // Close all dialogs
  closeAllDialogs(): void {
    this.showApproveDialog = false;
    this.showRejectDialog = false;
    this.selectedReview = null;
    this.isSubmitting = false;
  }

  // Handle backdrop click
  onDialogBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeAllDialogs();
    }
  }

  changePage(page: number): void {
    this.filter.pageNumber = page;
    this.loadReviews();
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getReviewName(): string {
    if (!this.selectedReview) return '';
    return this.i18n.currentLang === 'ar'
      ? (this.selectedReview.productNameAr ?? '')
      : (this.selectedReview.productNameEn ?? '');
  }
}