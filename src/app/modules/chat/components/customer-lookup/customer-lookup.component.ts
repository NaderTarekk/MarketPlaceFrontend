import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ToastrService } from 'ngx-toastr';

interface OrderRow {
  orderId: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  itemsCount: number;
}

interface LookupResult {
  customerId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  createdAt: string;
  orders: OrderRow[];
}

@Component({
  selector: 'app-customer-lookup',
  standalone: false,
  templateUrl: './customer-lookup.component.html',
  styleUrl: './customer-lookup.component.css',
})
export class CustomerLookupComponent {
  query = '';
  isLoading = false;
  isStartingChat = false;
  result: LookupResult | null = null;
  errorMessage = '';

  constructor(
    private chatService: ChatService,
    public i18n: I18nService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  search(): void {
    if (!this.query?.trim()) {
      this.toastr.warning(
        this.i18n.currentLang === 'ar' ? 'أدخل رقم أوردر أو بريد إلكتروني' : 'Enter an order number or email'
      );
      return;
    }
    this.isLoading = true;
    this.result = null;
    this.errorMessage = '';

    this.chatService.lookupCustomer(this.query.trim()).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.result = res.data;
        } else {
          this.errorMessage = res.message || (this.i18n.currentLang === 'ar' ? 'لم يتم العثور على العميل' : 'Customer not found');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || (this.i18n.currentLang === 'ar' ? 'لم يتم العثور على العميل' : 'Customer not found');
        this.cdr.detectChanges();
      }
    });
  }

  startChat(): void {
    if (!this.result?.customerId || this.isStartingChat) return;
    this.isStartingChat = true;

    this.chatService.startSessionWithCustomer(this.result.customerId).subscribe({
      next: (res: any) => {
        this.isStartingChat = false;
        if (res.success) {
          this.toastr.success(
            this.i18n.currentLang === 'ar' ? 'تم بدء المحادثة' : 'Chat started'
          );
          this.router.navigate(['/chat/agent-dashboard'], { queryParams: { sessionId: res.data.id } });
        } else {
          this.toastr.error(res.message || 'Error');
        }
      },
      error: (err) => {
        this.isStartingChat = false;
        this.toastr.error(err?.error?.message || (this.i18n.currentLang === 'ar' ? 'حدث خطأ' : 'Error'));
      }
    });
  }

  formatPrice(v: number): string {
    return (v || 0).toLocaleString() + ' ' + (this.i18n.currentLang === 'ar' ? 'ج.م' : 'EGP');
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString(this.i18n.currentLang === 'ar' ? 'ar-EG' : 'en-US');
  }

  statusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('deliver') || s === 'completed') return '#059669';
    if (s.includes('cancel') || s.includes('reject')) return '#dc2626';
    if (s.includes('pending')) return '#d97706';
    return '#0369a1';
  }
}
