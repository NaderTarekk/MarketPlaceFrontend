import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { Governorate, CreateGovernorate, UpdateGovernorate } from '../../../../models/governorate';
import { GovernorateService } from '../../services/governorate.service';
import { TranslationService } from '../../../../services/translation.service';

@Component({
  selector: 'app-governorates',
  standalone: false,
  templateUrl: './governorates.component.html',
  styleUrl: './governorates.component.css'
})
export class GovernoratesComponent implements OnInit {
  governorates: Governorate[] = [];
  isLoading = true;

  // Dialog
  showDialog = false;
  isEditMode = false;
  selectedGovernorate: Governorate | null = null;
  isSubmitting = false;

  form: CreateGovernorate = {
    nameAr: '',
    nameEn: '',
    shippingCost: 0,
    isFreeShipping: false,
    sortOrder: 0,
    estimatedDeliveryDays: 3
  };

  // Delete
  showDeleteDialog = false;
  governorateToDelete: Governorate | null = null;
  isDeleting = false;

  // Seed
  isSeeding = false;
  showSeedDialog = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private governorateService: GovernorateService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadGovernorates();
  }

  loadGovernorates(): void {
    this.isLoading = true;
    this.governorateService.getAll(false).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.governorates = res.data;
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

  // ═══════════════════════════════════════════════
  // CRUD
  // ═══════════════════════════════════════════════

  openAddDialog(): void {
    this.isEditMode = false;
    this.selectedGovernorate = null;
    this.resetForm();
    this.showDialog = true;
  }

  openEditDialog(gov: Governorate): void {
    this.isEditMode = true;
    this.selectedGovernorate = gov;
    this.form = {
      nameAr: gov.nameAr,
      nameEn: gov.nameEn,
      shippingCost: gov.shippingCost,
      isFreeShipping: gov.isFreeShipping,
      sortOrder: gov.sortOrder,
      estimatedDeliveryDays: gov.estimatedDeliveryDays || 3
    };
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      nameAr: '',
      nameEn: '',
      shippingCost: 0,
      isFreeShipping: false,
      sortOrder: 0
    };
  }

  saveGovernorate(): void {
    if (!this.form.nameAr || !this.form.nameEn) {
      this.showToast(this.t('name_required'), 'error');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedGovernorate) {
      const updateData: UpdateGovernorate = { ...this.form };
      this.governorateService.update(this.selectedGovernorate.id, updateData).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.showToast(this.t('updated'), 'success');
            this.loadGovernorates();
            this.closeDialog();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
          this.isSubmitting = false;
        },
        error: (err: any) => {
          this.showToast(err.error?.message || 'Error', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.governorateService.create(this.form).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.showToast(this.t('created'), 'success');
            this.loadGovernorates();
            this.closeDialog();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
          this.isSubmitting = false;
        },
        error: (err: any) => {
          this.showToast(err.error?.message || 'Error', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  // Delete
  openDeleteDialog(gov: Governorate): void {
    this.governorateToDelete = gov;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.governorateToDelete = null;
  }

  confirmDelete(): void {
    if (!this.governorateToDelete) return;

    this.isDeleting = true;
    this.governorateService.delete(this.governorateToDelete.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showToast(this.t('deleted'), 'success');
          this.loadGovernorates();
          this.closeDeleteDialog();
        } else {
          this.showToast(res.message || 'Error', 'error');
        }
        this.isDeleting = false;
      },
      error: (err: any) => {
        this.showToast(err.error?.message || 'Error', 'error');
        this.isDeleting = false;
      }
    });
  }

  // Toggle Active
  toggleActive(gov: Governorate): void {
    this.governorateService.update(gov.id, { isActive: !gov.isActive }).subscribe({
      next: (res: any) => {
        if (res.success) {
          gov.isActive = !gov.isActive;
          this.showToast(
            gov.isActive ? this.t('activated') : this.t('deactivated'),
            'success'
          );
          this.cdr.detectChanges();
        }
      }
    });
  }

  // Toggle Free Shipping
  toggleFreeShipping(gov: Governorate): void {
    this.governorateService.update(gov.id, { isFreeShipping: !gov.isFreeShipping }).subscribe({
      next: (res: any) => {
        if (res.success) {
          gov.isFreeShipping = !gov.isFreeShipping;
          this.cdr.detectChanges();
        }
      }
    });
  }

  // Seed Governorates
  openSeedDialog(): void {
    this.showSeedDialog = true;
  }

  closeSeedDialog(): void {
    this.showSeedDialog = false;
  }

  confirmSeed(): void {
    this.showSeedDialog = false;
    this.isSeeding = true;
    this.governorateService.seedGovernorates().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showToast(this.t('seeded'), 'success');
          this.loadGovernorates();
        }
        this.isSeeding = false;
      },
      error: () => {
        this.showToast(this.t('seed_error'), 'error');
        this.isSeeding = false;
      }
    });
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  getName(gov: Governorate): string {
    return this.i18n.currentLang === 'ar' ? gov.nameAr : gov.nameEn;
  }

  formatPrice(price: number): string {
    return price.toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'خطأ في التحميل', en: 'Error loading data' },
      'name_required': { ar: 'الاسم مطلوب', en: 'Name is required' },
      'created': { ar: 'تم إضافة المحافظة', en: 'Governorate added' },
      'updated': { ar: 'تم تحديث المحافظة', en: 'Governorate updated' },
      'deleted': { ar: 'تم حذف المحافظة', en: 'Governorate deleted' },
      'activated': { ar: 'تم تفعيل المحافظة', en: 'Governorate activated' },
      'deactivated': { ar: 'تم إلغاء تفعيل المحافظة', en: 'Governorate deactivated' },
      'seeded': { ar: 'تم إضافة المحافظات', en: 'Governorates added' },
      'seed_error': { ar: 'خطأ في إضافة المحافظات', en: 'Error adding governorates' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
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

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}