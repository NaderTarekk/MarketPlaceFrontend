// categories.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Category, CategoryFilterParams, CreateCategoryDto, UpdateCategoryDto } from '../../../../models/category';
import { I18nService } from '../../../../core/services/i18n.service';
import { CategoriesService } from '../../services/categories.service';
import { environment } from '../../../../../environment';

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

  // 🆕 Parent categories for dropdown
  parentCategories: Category[] = [];

  // Loading States
  isLoading = false;
  isSubmitting = false;
  isLoadingParents = false;

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalCount = 0;
  totalPages = 0;

  // Image Upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  // Filters
  searchTerm = '';
  filterStatus: boolean | null = null;

  // 🆕 Hierarchy Filter
  filterType: 'all' | 'parents' | 'children' = 'all';
  filterParentId: number | null = null;

  // Modals
  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Selected Category
  selectedCategory: Category | null = null;

  // 🆕 Form Data with parentId
  formData: CreateCategoryDto & { isActive?: boolean } = {
    nameAr: '',
    nameEn: '',
    parentId: null
  };
  formErrors: { nameAr?: string; nameEn?: string } = {};

  // Toast
  toast = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  // 🆕 Expanded rows (to show children inline)
  expandedRows: Set<number> = new Set();

  constructor(
    public i18n: I18nService,
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadParentCategories();
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

  // 🆕 Load parent categories for dropdown
  loadParentCategories(): void {
    this.isLoadingParents = true;
    this.categoriesService.getParents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLoadingParents = false;
          if (res.success) {
            this.parentCategories = res.data || [];
          }
        },
        error: () => {
          this.isLoadingParents = false;
        }
      });
  }

  loadCategories(): void {
    this.isLoading = true;

    const filter: CategoryFilterParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      isActive: this.filterStatus,
      includeChildren: true // 🆕 Include children
    };

    // 🆕 Apply hierarchy filter
    if (this.filterType === 'parents') {
      filter.parentOnly = true;
    } else if (this.filterType === 'children') {
      filter.childrenOnly = true;
    }

    if (this.filterParentId) {
      filter.parentId = this.filterParentId;
    }

    this.categoriesService.getAll(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            this.categories = res.data || [];
            this.totalCount = res.pagination.totalCount;
            this.totalPages = res.pagination.totalPages;
            this.currentPage = res.pagination.currentPage;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.showToast(
            this.i18n.currentLang === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error loading data',
            'error'
          );
        }
      });
  }

  // Filter Methods
  setStatusFilter(status: boolean | null): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.loadCategories();
  }

  // 🆕 Set type filter (all/parents/children)
  setTypeFilter(type: 'all' | 'parents' | 'children'): void {
    this.filterType = type;
    this.filterParentId = null;
    this.currentPage = 1;
    this.loadCategories();
  }

  // 🆕 Filter by specific parent
  filterByParent(parentId: number | null): void {
    this.filterParentId = parentId;
    this.filterType = parentId ? 'children' : 'all';
    this.currentPage = 1;
    this.loadCategories();
  }

  // 🆕 Toggle row expansion
  toggleRowExpand(categoryId: number): void {
    if (this.expandedRows.has(categoryId)) {
      this.expandedRows.delete(categoryId);
    } else {
      this.expandedRows.add(categoryId);
    }
  }

  isRowExpanded(categoryId: number): boolean {
    return this.expandedRows.has(categoryId);
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
  openAddModal(parentId: number | null = null): void {
    this.formData = {
      nameAr: '',
      nameEn: '',
      image: undefined,
      parentId: parentId // 🆕 Pre-select parent if adding subcategory
    };
    this.formErrors = {};
    this.selectedFile = null;
    this.imagePreview = null;
    this.showAddModal = true;
  }

  openEditModal(category: Category): void {
    this.selectedCategory = category;
    this.formData = {
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      image: category.image,
      parentId: category.parentId, // 🆕 Include parentId
      isActive: category.isActive
    };
    this.formErrors = {};
    this.selectedFile = null;
    this.imagePreview = null;
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
    this.formData = { nameAr: '', nameEn: '', parentId: null };
    this.formErrors = {};
    this.selectedFile = null;
    this.imagePreview = null;
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
      nameEn: this.formData.nameEn!.trim(),
      image: this.formData.image,
      parentId: this.formData.parentId // 🆕
    };

    this.categoriesService.create(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.showToast(
              this.i18n.currentLang === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category added successfully',
              'success'
            );
            this.closeModals();
            this.loadCategories();
            this.loadParentCategories(); // 🆕 Refresh parents list
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
      image: this.formData.image,
      parentId: this.formData.parentId, // 🆕
      isActive: this.formData.isActive
    };

    this.categoriesService.update(this.selectedCategory.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.showToast(
              this.i18n.currentLang === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully',
              'success'
            );
            this.closeModals();
            this.loadCategories();
            this.loadParentCategories(); // 🆕 Refresh parents list
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
            this.showToast(
              this.i18n.currentLang === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully',
              'success'
            );
            this.closeModals();
            this.loadCategories();
            this.loadParentCategories(); // 🆕 Refresh parents list
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
          this.cdr.detectChanges();
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

  // 🆕 Get parent name for display
  getParentName(category: Category): string {
    if (!category.parentId) return '-';
    return this.i18n.currentLang === 'ar'
      ? (category.parentNameAr || '-')
      : (category.parentNameEn || '-');
  }

  // 🆕 Check if category has children
  hasChildren(category: Category): boolean {
    return (category.children && category.children.length > 0) || category.hasChildren || false;
  }

  // 🆕 Get children count
  getChildrenCount(category: Category): number {
    return category.children?.length || category.childrenCount || 0;
  }

  // 🆕 Check if category is a subcategory
  isSubcategory(category: Category): boolean {
    return category.parentId !== null && category.parentId !== undefined;
  }

  // 🆕 Get available parents for dropdown (exclude self and children in edit mode)
  getAvailableParents(): Category[] {
    if (!this.selectedCategory) {
      return this.parentCategories;
    }
    // Exclude the category being edited from parent options
    return this.parentCategories.filter(p => p.id !== this.selectedCategory!.id);
  }

  // Toast
  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  // Image Upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'نوع الملف غير مدعوم' : 'File type not supported',
          'error'
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showToast(
          this.i18n.currentLang === 'ar' ? 'حجم الملف كبير جداً' : 'File size too large',
          'error'
        );
        return;
      }

      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
      this.cdr.markForCheck();
    }

    input.value = '';
  }

  async uploadAndSave(): Promise<void> {
    if (this.selectedFile) {
      this.isUploading = true;

      this.categoriesService.uploadImage(this.selectedFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.formData.image = res.data;
              this.isUploading = false;

              if (this.showAddModal) {
                this.createCategory();
              } else {
                this.updateCategory();
              }
            }
          },
          error: () => {
            this.isUploading = false;
            this.showToast(
              this.i18n.currentLang === 'ar' ? 'فشل في رفع الصورة' : 'Failed to upload image',
              'error'
            );
          }
        });
    } else {
      if (this.showAddModal) {
        this.createCategory();
      } else {
        this.updateCategory();
      }
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.formData.image = null;
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'https://placehold.co/150x150/e2e8f0/94a3b8?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${environment.baseApi}${path}`;
  }
}