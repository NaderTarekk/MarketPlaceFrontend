import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintsService } from '../../services/complaints.service';
import { ProductsService } from '../../../products/services/products.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-complaints',
  standalone: false,
  templateUrl: './complaints.component.html',
  styleUrl: './complaints.component.css',
})
export class ComplaintsComponent implements OnInit {
  complaintForm: FormGroup;
  myComplaints: any[] = [];
  products: any[] = [];
  brands: any[] = [];
  loading = false;
  showForm = false;
  isSubmitting = false;

  complaintTypes = [
    { value: 1, label: 'منتج' },
    { value: 2, label: 'براند' },
    { value: 3, label: 'تاجر' },
    { value: 4, label: 'خدمة' },
    { value: 5, label: 'أخرى' }
  ];

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintsService,
    private productService: ProductsService,
    public i18n: I18nService,
    private cdr: ChangeDetectorRef
  ) {
    this.complaintForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      type: [1, Validators.required],
      productId: [null],
      brandId: [null],
      sellerId: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    forkJoin({
      complaints: this.complaintService.getMyComplaints(),
      products: this.productService.getAll({ page: 1, pageSize: 100 }),
      brands: this.productService.getBrands(true)
    }).subscribe({
      next: (res) => {
        console.log(res);
        
        this.myComplaints = res.complaints || [];
        this.products = res.products.success ? res.products.data : [];
        this.brands = res.brands.success ? res.brands.data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل البيانات',
          confirmButtonText: 'حسناً'
        });
        this.cdr.detectChanges();
      }
    });
  }

  getName(item: any): string {
    return this.i18n.currentLang === 'ar' ? item.nameAr : item.nameEn;
  }

  onTypeChange(event: any): void {
    this.complaintForm.patchValue({
      productId: null,
      brandId: null,
      sellerId: null
    });
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول المطلوبة',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    this.isSubmitting = true;

    this.complaintService.createComplaint(this.complaintForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        Swal.fire({
          icon: 'success',
          title: 'نجح',
          text: 'تم إرسال الشكوى بنجاح',
          confirmButtonText: 'حسناً',
          timer: 2000
        });

        this.complaintForm.reset({ type: 1 });
        this.showForm = false;
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting = false;
        
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: err.error?.message || 'حدث خطأ أثناء إرسال الشكوى',
          confirmButtonText: 'حسناً'
        });
        
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'UnderReview': return 'status-review';
      case 'Resolved': return 'status-resolved';
      case 'Rejected': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Pending': return 'قيد الانتظار';
      case 'UnderReview': return 'قيد المراجعة';
      case 'Resolved': return 'تم الحل';
      case 'Rejected': return 'مرفوضة';
      default: return status;
    }
  }
}