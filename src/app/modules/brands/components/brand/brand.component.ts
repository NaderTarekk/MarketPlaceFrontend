import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Brand } from '../../../../models/brand';
import { I18nService } from '../../../../core/services/i18n.service';
import { BrandService } from '../../services/brand.service';
import { environment } from '../../../../../environment';
import Swal from 'sweetalert2';
import { ComplaintsService } from '../../../complaints/services/complaints.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'app-brand',
  standalone: false,
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  filteredBrands: Brand[] = [];
  isLoading = true;
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';

  // Dialog States
  showCreateDialog = false;
  showEditDialog = false;
  showDeleteDialog = false;
  showViewDialog = false;
  isSubmitting = false;

  // Form Data
  selectedBrand: Brand | null = null;
  formData = {
    nameAr: '',
    nameEn: '',
    isActive: true
  };
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  removeLogo = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private brandService: BrandService,
    private cdr: ChangeDetectorRef,
    private complaintService: ComplaintsService,
    private translationService: TranslationService,
  ) { }

  ngOnInit(): void {
    this.loadBrands();
  }

  // ═══════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════

  loadBrands(): void {
    this.isLoading = true;
    this.brandService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.brands = res.data;
          this.filteredBrands = res.data;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.showToast(this.i18n.currentLang === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data', 'error');
        this.isLoading = false;
      }
    });
  }

  // ═══════════════════════════════════════════════
  // SEARCH & FILTER
  // ═══════════════════════════════════════════════

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredBrands = this.brands;
      return;
    }
    this.filteredBrands = this.brands.filter(brand =>
      brand.nameAr.toLowerCase().includes(query) ||
      brand.nameEn.toLowerCase().includes(query)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredBrands = this.brands;
  }

  // ═══════════════════════════════════════════════
  // DIALOG CONTROLS
  // ═══════════════════════════════════════════════

  openCreateDialog(): void {
    this.resetForm();
    this.showCreateDialog = true;
  }

  openEditDialog(brand: Brand): void {
    this.selectedBrand = brand;
    this.formData = {
      nameAr: brand.nameAr,
      nameEn: brand.nameEn,
      isActive: brand.isActive
    };
    this.imagePreview = brand.logo ? this.getLogoUrl(brand.logo) : null;
    this.selectedFile = null;
    this.removeLogo = false;
    this.showEditDialog = true;
  }

  openDeleteDialog(brand: Brand): void {
    this.selectedBrand = brand;
    this.showDeleteDialog = true;
  }

  openViewDialog(brand: Brand): void {
    this.selectedBrand = brand;
    console.log(brand);
    
    console.log(this.selectedBrand);
    
    this.showViewDialog = true;
  }

  closeAllDialogs(): void {
    this.showCreateDialog = false;
    this.showEditDialog = false;
    this.showDeleteDialog = false;
    this.showViewDialog = false;
    this.selectedBrand = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = { nameAr: '', nameEn: '', isActive: true };
    this.selectedFile = null;
    this.imagePreview = null;
    this.removeLogo = false;
  }

  // ═══════════════════════════════════════════════
  // FILE HANDLING
  // ═══════════════════════════════════════════════

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToast(this.i18n.currentLang === 'ar' ? 'حجم الصورة كبير جداً' : 'Image size too large', 'error');
        return;
      }

      this.selectedFile = file;
      this.removeLogo = false;

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.removeLogo = true;
  }

  // ═══════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════

  createBrand(): void {
    if (!this.formData.nameAr || !this.formData.nameEn) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'error');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('nameAr', this.formData.nameAr);
    formData.append('nameEn', this.formData.nameEn);
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.brandService.create(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم إنشاء العلامة التجارية بنجاح' : 'Brand created successfully', 'success');
          this.loadBrands();
          this.closeAllDialogs();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmitting = false;
      }
    });
  }

  updateBrand(): void {
    if (!this.selectedBrand || !this.formData.nameAr || !this.formData.nameEn) {
      this.showToast(this.i18n.currentLang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'error');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('nameAr', this.formData.nameAr);
    formData.append('nameEn', this.formData.nameEn);
    formData.append('isActive', this.formData.isActive.toString());
    formData.append('removeLogo', this.removeLogo.toString());
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.brandService.update(this.selectedBrand.id, formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم تحديث العلامة التجارية بنجاح' : 'Brand updated successfully', 'success');
          this.loadBrands();
          this.closeAllDialogs();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmitting = false;
      }
    });
    this.isSubmitting = false;

  }

  deleteBrand(): void {
    if (!this.selectedBrand) return;

    this.isSubmitting = true;
    this.brandService.delete(this.selectedBrand.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.i18n.currentLang === 'ar' ? 'تم حذف العلامة التجارية بنجاح' : 'Brand deleted successfully', 'success');
          this.loadBrands();
          this.closeAllDialogs();
        } else {
          this.showToast(res.message, 'error');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isSubmitting = false;
      }
    });
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  getName(brand: Brand): string {
    return this.i18n.currentLang === 'ar' ? brand.nameAr : brand.nameEn;
  }

  getLogoUrl(logo: string | null): string {
    if (!logo) return '';
    if (logo.startsWith('http')) return logo;
    return `${environment.baseApi.replace('/api', '')}${logo}`;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
    }, 3000);
  }

  get activeBrandsCount(): number {
    return this.brands.filter(b => b.isActive).length;
  }

  get inactiveBrandsCount(): number {
    return this.brands.filter(b => !b.isActive).length;
  }

  trackByBrand(index: number, brand: Brand): number {
    return brand.id;
  }

  onDialogBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeAllDialogs();
    }
  }

  blockBrand(brand: Brand): void {
    Swal.fire({
      title: this.i18n.currentLang === 'ar' ? 'حظر البراند' : 'Block Brand',
      input: 'textarea',
      inputLabel: this.i18n.currentLang === 'ar' ? 'سبب الحظر' : 'Block Reason',
      inputPlaceholder: this.i18n.currentLang === 'ar' ? 'اكتب سبب الحظر...' : 'Enter block reason...',
      showCancelButton: true,
      confirmButtonText: this.i18n.currentLang === 'ar' ? 'حظر' : 'Block',
      cancelButtonText: this.i18n.currentLang === 'ar' ? 'إلغاء' : 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return this.i18n.currentLang === 'ar' ? 'يجب كتابة السبب' : 'Reason is required';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.complaintService.blockBrand({
          brandId: brand.id,
          reason: result.value
        }).subscribe({
          next: () => {
            Swal.fire(
              this.i18n.currentLang === 'ar' ? 'تم الحظر' : 'Blocked',
              this.i18n.currentLang === 'ar' ? 'تم حظر البراند بنجاح' : 'Brand blocked successfully',
              'success'
            );
            this.loadBrands();
          },
          error: (err) => {
            Swal.fire(
              this.i18n.currentLang === 'ar' ? 'خطأ' : 'Error',
              err.error?.message || (this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred'),
              'error'
            );
          }
        });
      }
    });
  }

  unblockBrand(brand: Brand): void {
    Swal.fire({
      title: this.i18n.currentLang === 'ar' ? 'إلغاء الحظر' : 'Unblock Brand',
      text: this.i18n.currentLang === 'ar' ? 'هل تريد إلغاء حظر هذا البراند؟' : 'Do you want to unblock this brand?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.i18n.currentLang === 'ar' ? 'نعم' : 'Yes',
      cancelButtonText: this.i18n.currentLang === 'ar' ? 'إلغاء' : 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.complaintService.unblockBrand(brand.id).subscribe({
          next: () => {
            Swal.fire(
              this.i18n.currentLang === 'ar' ? 'تم إلغاء الحظر' : 'Unblocked',
              this.i18n.currentLang === 'ar' ? 'تم إلغاء حظر البراند بنجاح' : 'Brand unblocked successfully',
              'success'
            );
            this.loadBrands();
          },
          error: () => {
            Swal.fire(
              this.i18n.currentLang === 'ar' ? 'خطأ' : 'Error',
              this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'An error occurred',
              'error'
            );
          }
        });
      }
    });
  }

  onArBlur(form: any, arField: string, enField: string): void {
    if (!form[arField]?.trim()) return;
    this.translationService.translateArToEn(form[arField]).subscribe({
      next: (t: string) => { if (t) { form[enField] = t; } }
    });
  }

  onEnBlur(form: any, arField: string, enField: string): void {
    if (!form[enField]?.trim()) return;
    this.translationService.translateEnToAr(form[enField]).subscribe({
      next: (t: string) => { if (t) { form[arField] = t; } }
    });
  }

  get blockedBrandsCount(): number {
    return this.brands.filter(b => b.isBlocked).length;
  }
}
