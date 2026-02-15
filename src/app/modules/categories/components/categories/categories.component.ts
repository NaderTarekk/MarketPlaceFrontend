import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Category, CategoryFilterParams, CreateCategoryDto, UpdateCategoryDto } from '../../../../models/category';
import { I18nService } from '../../../../core/services/i18n.service';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data
  categories: Category[] = [];

  // Loading States
  isLoading = false;
  isSubmitting = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Filter
  searchTerm = '';
  filterStatus: boolean | null = null;

  // Modals
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Selected Category
  selectedCategory: Category | null = null;

  // Form Data
  formData: CreateCategoryDto | UpdateCategoryDto = {
    nameAr: '',
    nameEn: ''
  };
  formErrors: { nameAr?: string; nameEn?: string } = {};

  // Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    public i18n: I18nService,
    private categoriesService: CategoriesService,
    private cdr:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCategories();
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  loadCategories(): void {
    this.isLoading = true;

    const filter: CategoryFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      isActive: this.filterStatus
    };

    this.categoriesService.getAll(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.categories = res.data || [];
            this.totalCount = res.totalCount;
            this.totalPages = res.totalPages;
          }
          this.cdr.detectChanges()
        },
        error: () => {
          this.isLoading = false;
          this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error loading data', 'error');
        }
      });
  }

  // Filter Methods
  setStatusFilter(status: boolean | null): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.loadCategories();
  }

  // Pagination Methods
  get hasPrev(): boolean {
    return this.currentPage > 1;
  }

  get hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  prevPage(): void {
    if (this.hasPrev) {
      this.currentPage--;
      this.loadCategories();
    }
  }

  nextPage(): void {
    if (this.hasNext) {
      this.currentPage++;
      this.loadCategories();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal Methods
  openAddModal(): void {
    this.formData = { nameAr: '', nameEn: '' };
    this.formErrors = {};
    this.showAddModal = true;
  }

  openEditModal(category: Category): void {
    this.selectedCategory = category;
    this.formData = {
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      isActive: category.isActive
    };
    this.formErrors = {};
    this.showEditModal = true;
  }

  openDeleteModal(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedCategory = null;
    this.formData = { nameAr: '', nameEn: '' };
    this.formErrors = {};
  }

  // Validation
  validateForm(): boolean {
    this.formErrors = {};
    let isValid = true;

    if (!this.formData.nameAr?.trim()) {
      this.formErrors.nameAr = this.i18n.currentLang === 'ar' ? 'الاسم بالعربي مطلوب' : 'Arabic name is required';
      isValid = false;
    }

    if (!this.formData.nameEn?.trim()) {
      this.formErrors.nameEn = this.i18n.currentLang === 'ar' ? 'الاسم بالإنجليزي مطلوب' : 'English name is required';
      isValid = false;
    }

    return isValid;
  }

  // CRUD Operations
  createCategory(): void {
    if (!this.validateForm()) return;

    this.isSubmitting = true;
    const dto: CreateCategoryDto = {
      nameAr: this.formData.nameAr!.trim(),
      nameEn: this.formData.nameEn!.trim()
    };

    this.categoriesService.create(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.showToast(this.i18n.currentLang === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category added successfully', 'success');
            this.closeModals();
            this.loadCategories();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
        }
      });
  }

  updateCategory(): void {
    if (!this.selectedCategory || !this.validateForm()) return;

    this.isSubmitting = true;
    const dto: UpdateCategoryDto = {
      nameAr: this.formData.nameAr?.trim(),
      nameEn: this.formData.nameEn?.trim(),
      isActive: (this.formData as UpdateCategoryDto).isActive
    };

    this.categoriesService.update(this.selectedCategory.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.showToast(this.i18n.currentLang === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully', 'success');
            this.closeModals();
            this.loadCategories();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
        }
      });
  }

  deleteCategory(): void {
    if (!this.selectedCategory) return;

    this.isSubmitting = true;

    this.categoriesService.delete(this.selectedCategory.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.showToast(this.i18n.currentLang === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully', 'success');
            this.closeModals();
            this.loadCategories();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
        }
      });
  }

  // Toggle Status
  toggleStatus(category: Category): void {
    const dto: UpdateCategoryDto = { isActive: !category.isActive };

    this.categoriesService.update(category.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            category.isActive = !category.isActive;
            this.showToast(
              this.i18n.currentLang === 'ar' ? 'تم تغيير الحالة' : 'Status changed',
              'success'
            );
          }
          this.cdr.detectChanges()
        },
        error: () => {
          this.showToast(this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred', 'error');
        }
      });
  }

  // Helper Methods
  getName(item: { nameAr: string; nameEn: string }): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  // Toast
  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

}
