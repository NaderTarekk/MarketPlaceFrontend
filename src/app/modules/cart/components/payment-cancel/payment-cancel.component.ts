import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-payment-cancel',
  standalone: false,
  template: `
    <div class="payment-result-page">
      <div class="result-container cancel">
        <div class="icon-wrapper">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <h1>{{ i18n.currentLang === 'ar' ? 'تم إلغاء الدفع' : 'Payment Cancelled' }}</h1>
        <p>{{ i18n.currentLang === 'ar' ? 'لم يتم إتمام عملية الدفع. يمكنك المحاولة مرة أخرى.' : 'Payment was not completed. You can try again.' }}</p>

        <div class="actions">
          <button class="btn-primary" (click)="router.navigate(['/cart'])">
            <i class="fa-solid fa-cart-shopping"></i>
            {{ i18n.currentLang === 'ar' ? 'العودة للسلة' : 'Back to Cart' }}
          </button>
          <button class="btn-secondary" (click)="router.navigate(['/'])">
            <i class="fa-solid fa-house"></i>
            {{ i18n.currentLang === 'ar' ? 'الرئيسية' : 'Home' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .result-container {
      text-align: center;
      max-width: 500px;
      padding: 3rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cancel .icon-wrapper i {
      font-size: 3rem;
      color: white;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #ef4444;
    }

    p {
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 2rem;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class PaymentCancelComponent {
  constructor(
    public router: Router,
    public i18n: I18nService
  ) {}
}