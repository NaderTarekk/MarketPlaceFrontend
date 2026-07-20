import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';
import { ProductsService } from '../../services/products.service';
import { Store } from '../../../../models/products';
import { environment } from '../../../../../environment';
import { ChatService } from '../../../chat/services/chat.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stores',
  standalone: false,
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoresComponent implements OnInit {
  stores: Store[] = [];
  isLoading = true;
  search = '';

  chattingVendorId: string | null = null;

  constructor(
    public i18n: I18nService,
    private productService: ProductsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private chatService: ChatService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  chatWithVendor(store: Store, event: Event): void {
    event.stopPropagation();
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.chattingVendorId === store.vendorId) return;
    this.chattingVendorId = store.vendorId;
    this.chatService.startSessionWithVendor(store.vendorId).subscribe({
      next: (res: any) => {
        this.chattingVendorId = null;
        if (res.success) {
          this.router.navigate(['/chat'], { queryParams: { sessionId: res.data.id } });
        } else {
          this.toastr.error(res.message || 'Error');
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.chattingVendorId = null;
        this.toastr.error(err?.error?.message || (this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error'));
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.productService.getStores().subscribe({
      next: (res) => {
        if (res.success) this.stores = res.data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredStores(): Store[] {
    if (!this.search.trim()) return this.stores;
    const q = this.search.toLowerCase();
    return this.stores.filter(s => s.vendorName.toLowerCase().includes(q));
  }

  browseStore(store: Store): void {
    this.router.navigate(['/products'], {
      queryParams: { vendorId: store.vendorId, storeName: store.vendorName }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  getImageUrl(image: string | null): string {
    if (!image) return '';
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return `${environment.baseApi}${image}`;
  }
}
