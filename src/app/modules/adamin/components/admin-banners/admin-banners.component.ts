import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { environment } from '../../../../../environment';
import { Banner, CreateBanner } from '../../../../models/banner';
import { BannerService } from '../../services/banner.service';

@Component({
  selector: 'app-admin-banners',
  standalone: false,
  templateUrl: './admin-banners.component.html',
  styleUrl: './admin-banners.component.css'
})
export class AdminBannersComponent implements OnInit {
  banners: Banner[] = [];
  isLoading = true;

  // Dialog
  showDialog = false;
  isEditing = false;
  editingId: number | null = null;
  isSaving = false;

  // Form
  bannerForm: CreateBanner = {
    title: '',
    titleAr: '',
    subtitle: '',
    subtitleAr: '',
    buttonText: 'Shop Now',
    buttonTextAr: 'تسوق الآن',
    buttonLink: '/products',
    displayOrder: 0,
    isActive: true
  };
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  // Delete
  showDeleteDialog = false;
  bannerToDelete: Banner | null = null;
  isDeleting = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private bannerService: BannerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.isLoading = true;
    this.bannerService.getAll(false).subscribe({
      next: (res) => {
        if (res.success) {
          this.banners = res.data;
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
  // DIALOG
  // ═══════════════════════════════════════════════

  openAddDialog(): void {
    this.isEditing = false;
    this.editingId = null;
    this.bannerForm = {
      title: '',
      titleAr: '',
      subtitle: '',
      subtitleAr: '',
      buttonText: 'Shop Now',
      buttonTextAr: 'تسوق الآن',
      buttonLink: '/products',
      displayOrder: this.banners.length,
      isActive: true
    };
    this.selectedImage = null;
    this.imagePreview = null;
    this.showDialog = true;
    document.body.style.overflow = 'hidden';
  }

  openEditDialog(banner: Banner): void {
    this.isEditing = true;
    this.editingId = banner.id;
    this.bannerForm = {
      title: banner.title,
      titleAr: banner.titleAr,
      subtitle: banner.subtitle,
      subtitleAr: banner.subtitleAr,
      buttonText: banner.buttonText,
      buttonTextAr: banner.buttonTextAr,
      buttonLink: banner.buttonLink,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive
    };
    this.selectedImage = null;
    this.imagePreview = this.getImageUrl(banner.imageUrl);
    this.showDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDialog(): void {
    this.showDialog = false;
    document.body.style.overflow = '';
  }

  // ═══════════════════════════════════════════════
  // IMAGE
  // ═══════════════════════════════════════════════

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  // ═══════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════

  saveBanner(): void {
    if (!this.bannerForm.title || !this.bannerForm.titleAr) {
      this.showToast(this.t('fill_required'), 'error');
      return;
    }

    if (!this.isEditing && !this.selectedImage) {
      this.showToast(this.t('select_image'), 'error');
      return;
    }

    this.isSaving = true;

    if (this.isEditing && this.editingId) {
      this.bannerService.update(this.editingId, this.bannerForm, this.selectedImage || undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast(this.t('banner_updated'), 'success');
            this.loadBanners();
            this.closeDialog();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
          this.isSaving = false;
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Error', 'error');
          this.isSaving = false;
        }
      });
    } else {
      this.bannerService.create(this.bannerForm, this.selectedImage!).subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast(this.t('banner_created'), 'success');
            this.loadBanners();
            this.closeDialog();
          } else {
            this.showToast(res.message || 'Error', 'error');
          }
          this.isSaving = false;
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Error', 'error');
          this.isSaving = false;
        }
      });
    }
  }

  // ═══════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════

  openDeleteDialog(banner: Banner): void {
    this.bannerToDelete = banner;
    this.showDeleteDialog = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.bannerToDelete = null;
    document.body.style.overflow = '';
  }

  confirmDelete(): void {
    if (!this.bannerToDelete) return;

    this.isDeleting = true;
    this.bannerService.delete(this.bannerToDelete.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('banner_deleted'), 'success');
          this.loadBanners();
          this.closeDeleteDialog();
        }
        this.isDeleting = false;
      },
      error: () => {
        this.showToast(this.t('error_deleting'), 'error');
        this.isDeleting = false;
      }
    });
  }

  // ═══════════════════════════════════════════════
  // TOGGLE
  // ═══════════════════════════════════════════════

  toggleBanner(banner: Banner): void {
    this.bannerService.toggle(banner.id).subscribe({
      next: (res) => {
        if (res.success) {
          banner.isActive = !banner.isActive;
          this.cdr.detectChanges();
        }
      }
    });
  }

  // ═══════════════════════════════════════════════
  // REORDER (Drag & Drop)
  // ═══════════════════════════════════════════════

  moveBanner(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.banners.length) return;

    const temp = this.banners[index];
    this.banners[index] = this.banners[newIndex];
    this.banners[newIndex] = temp;

    const ids = this.banners.map(b => b.id);
    this.bannerService.reorder(ids).subscribe();
    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  getImageUrl(image: string): string {
    if (!image) return 'assets/images/placeholder-banner.jpg';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getTitle(banner: Banner): string {
    return this.i18n.currentLang === 'ar' ? banner.titleAr : banner.title;
  }

  getSubtitle(banner: Banner): string {
    return this.i18n.currentLang === 'ar' ? banner.subtitleAr : banner.subtitle;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'حدث خطأ في التحميل', en: 'Error loading banners' },
      'error_deleting': { ar: 'حدث خطأ في الحذف', en: 'Error deleting banner' },
      'fill_required': { ar: 'يرجى ملء الحقول المطلوبة', en: 'Please fill required fields' },
      'select_image': { ar: 'يرجى اختيار صورة', en: 'Please select an image' },
      'banner_created': { ar: 'تم إنشاء البانر بنجاح', en: 'Banner created successfully' },
      'banner_updated': { ar: 'تم تحديث البانر بنجاح', en: 'Banner updated successfully' },
      'banner_deleted': { ar: 'تم حذف البانر', en: 'Banner deleted' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }

  trackById(index: number, item: Banner): number {
    return item.id;
  }
}