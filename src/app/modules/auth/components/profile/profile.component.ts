import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Profile, ProfileStats, UpdateProfile } from '../../../../models/profile';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  activeTab = 'personal';
  stats: ProfileStats = {
    ordersCount: 0,
    wishlistCount: 0,
    reviewsCount: 0
  };
  // Edit Form
  editForm: UpdateProfile = {};

  // Image Upload
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isUploadingImage = false;

  // Toast
  toast = { show: false, message: '', type: 'success' as 'success' | 'error' };

  constructor(
    public i18n: I18nService,
    private profileService: AuthService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadProfile();
    this.loadStats();
  }

  loadStats(): void {
    this.profileService.getProfileStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.profile = res.data;
          this.initEditForm();
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

  initEditForm(): void {
    if (!this.profile) return;
    this.editForm = {
      fullName: this.profile.fullName,
      phoneNumber: this.profile.phoneNumber || '',
      address: this.profile.address || '',
      city: this.profile.city || '',
      country: this.profile.country || '',
      dateOfBirth: this.profile.dateOfBirth ? this.profile.dateOfBirth.split('T')[0] : '',
      gender: this.profile.gender || '',
      bio: this.profile.bio || '',
      businessName: this.profile.businessName || '',
      businessAddress: this.profile.businessAddress || ''
    };
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initEditForm();
      this.imagePreview = null;
      this.selectedImage = null;
    }
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.isSaving = true;
    this.profileService.updateProfile(this.editForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('profile_updated'), 'success');
          this.loadProfile();
          this.isEditing = false;
        } else {
          this.showToast(res.message || this.t('error_updating'), 'error');
        }
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
        this.showToast(this.t('error_updating'), 'error');
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.showToast(this.t('invalid_image'), 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showToast(this.t('image_too_large'), 'error');
        return;
      }

      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedImage) return;

    this.isUploadingImage = true;
    this.profileService.uploadImage(this.selectedImage).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast(this.t('image_uploaded'), 'success');
          this.loadProfile();
          this.selectedImage = null;
          this.imagePreview = null;
        }
        this.isUploadingImage = false;
      },
      error: () => {
        this.isUploadingImage = false;
        this.showToast(this.t('error_uploading'), 'error');
      }
    });
  }

  cancelImageUpload(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Helpers
  getImageUrl(image: string | null): string {
    if (!image) return 'assets/images/default-avatar.png';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }

  getInitials(): string {
    if (!this.profile?.fullName) return 'U';
    return this.profile.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getRoleBadge(): { text: string; class: string } {
    switch (this.profile?.role) {
      case 'Admin':
        return { text: this.i18n.currentLang === 'ar' ? 'مدير' : 'Admin', class: 'admin' };
      case 'Vendor':
        return { text: this.i18n.currentLang === 'ar' ? 'تاجر' : 'Vendor', class: 'vendor' };
      case 'DeliveryAgent':
        return { text: this.i18n.currentLang === 'ar' ? 'مندوب' : 'Delivery', class: 'delivery' };
      default:
        return { text: this.i18n.currentLang === 'ar' ? 'عميل' : 'Customer', class: 'customer' };
    }
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString(this.i18n.currentLang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getMemberSince(): string {
    if (!this.profile?.createdAt) return '';
    const date = new Date(this.profile.createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 30) {
      return this.i18n.currentLang === 'ar' ? `${diff} يوم` : `${diff} days`;
    } else if (diff < 365) {
      const months = Math.floor(diff / 30);
      return this.i18n.currentLang === 'ar' ? `${months} شهر` : `${months} months`;
    } else {
      const years = Math.floor(diff / 365);
      return this.i18n.currentLang === 'ar' ? `${years} سنة` : `${years} years`;
    }
  }

  t(key: string): string {
    const translations: { [key: string]: { ar: string; en: string } } = {
      'error_loading': { ar: 'حدث خطأ في تحميل البيانات', en: 'Error loading data' },
      'error_updating': { ar: 'حدث خطأ في التحديث', en: 'Error updating profile' },
      'profile_updated': { ar: 'تم تحديث البيانات بنجاح', en: 'Profile updated successfully' },
      'invalid_image': { ar: 'الملف ليس صورة', en: 'File is not an image' },
      'image_too_large': { ar: 'حجم الصورة كبير جداً', en: 'Image is too large' },
      'image_uploaded': { ar: 'تم رفع الصورة بنجاح', en: 'Image uploaded successfully' },
      'error_uploading': { ar: 'حدث خطأ في رفع الصورة', en: 'Error uploading image' }
    };
    return translations[key]?.[this.i18n.currentLang] || key;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => {
      this.toast.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }

}
