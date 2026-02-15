import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-payment-success',
  standalone: false,
  template: `
    <div class="payment-result-page">
      <div class="result-container success">
        <div class="icon-wrapper">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h1>{{ i18n.currentLang === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!' }}</h1>
        <p>{{ i18n.currentLang === 'ar' ? 'تم تأكيد طلبك وسيتم التواصل معك قريباً' : 'Your order is confirmed and we will contact you soon' }}</p>
        
        <div class="session-info" *ngIf="sessionId">
          <small>Session ID: {{ sessionId }}</small>
        </div>

        <div class="actions">
          <button class="btn-primary" (click)="router.navigate(['/'])">
            <i class="fa-solid fa-house"></i>
            {{ i18n.currentLang === 'ar' ? 'الرئيسية' : 'Home' }}
          </button>
          <button class="btn-secondary" (click)="router.navigate(['/orders'])">
            <i class="fa-solid fa-list"></i>
            {{ i18n.currentLang === 'ar' ? 'طلباتي' : 'My Orders' }}
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success .icon-wrapper i {
      font-size: 3rem;
      color: white;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #10b981;
    }

    p {
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .session-info {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .session-info small {
      color: #6b7280;
      font-size: 0.875rem;
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  sessionId = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParams['session_id'] || '';
  }
}