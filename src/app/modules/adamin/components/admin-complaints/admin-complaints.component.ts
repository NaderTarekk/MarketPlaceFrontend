import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComplaintsService } from '../../../complaints/services/complaints.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-complaints',
  standalone: false,
  templateUrl: './admin-complaints.component.html',
  styleUrl: './admin-complaints.component.css',
})
export class AdminComplaintsComponent implements OnInit {
  complaints: any[] = [];
  filteredComplaints: any[] = [];
  blockedBrands: any[] = [];
  selectedComplaint: any = null;
  responseForm: FormGroup;
  blockBrandForm: FormGroup;
  loading = false;
  showResponseModal = false;
  showBlockModal = false;

  filterStatus: string = 'all';
  filterType: string = 'all';

  statusOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'Pending', label: 'قيد الانتظار' },
    { value: 'UnderReview', label: 'قيد المراجعة' },
    { value: 'Resolved', label: 'تم الحل' },
    { value: 'Rejected', label: 'مرفوضة' }
  ];

  typeOptions = [
    { value: 'all', label: 'الكل' },
    { value: 'Product', label: 'منتج' },
    { value: 'Brand', label: 'براند' },
    { value: 'Seller', label: 'تاجر' },
    { value: 'Service', label: 'خدمة' },
    { value: 'Other', label: 'أخرى' }
  ];

  constructor(
    private fb: FormBuilder,
    private complaintService: ComplaintsService,
    private cdr: ChangeDetectorRef
  ) {
    this.responseForm = this.fb.group({
      status: [2, Validators.required],
      adminResponse: ['', [Validators.required, Validators.maxLength(500)]]
    });

    this.blockBrandForm = this.fb.group({
      brandId: ['', Validators.required],
      reason: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadComplaints();
    this.loadBlockedBrands();
  }

  loadComplaints(): void {
    this.loading = true;
    this.complaintService.getAllComplaints().subscribe({
      next: (data) => {
        console.log('Complaints data:', data);
        this.complaints = data;
        this.applyFilters();
        this.loading = false;
      this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading complaints:', err);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء تحميل الشكاوي'
        });
      }
    });
  }

  loadBlockedBrands(): void {
    this.complaintService.getBlockedBrands().subscribe({
      next: (data) => {
        this.blockedBrands = data;
      },
      error: (err) => {
        console.error('Error loading blocked brands:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredComplaints = this.complaints.filter(complaint => {
      const statusMatch = this.filterStatus === 'all' || complaint.status === this.filterStatus;
      const typeMatch = this.filterType === 'all' || complaint.type === this.filterType;
      return statusMatch && typeMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getPendingCount(): number {
    return this.complaints.filter(c => c.status === 'Pending').length;
  }

  getResolvedCount(): number {
    return this.complaints.filter(c => c.status === 'Resolved').length;
  }

  openResponseModal(complaint: any): void {
    this.selectedComplaint = complaint;
    this.responseForm.patchValue({
      status: complaint.status === 'Pending' ? 2 : this.getStatusValue(complaint.status),
      adminResponse: complaint.adminResponse || ''
    });
    this.showResponseModal = true;
  }

  submitResponse(): void {
    if (this.responseForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى ملء جميع الحقول'
      });
      return;
    }

    this.loading = true;
    const data = this.responseForm.value;
    
    this.complaintService.updateComplaintStatus(this.selectedComplaint.id, data).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'نجح',
          text: 'تم تحديث الشكوى بنجاح'
        });
        this.showResponseModal = false;
        this.loadComplaints();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء التحديث'
        });
        console.error(err);
      }
    });
  }

  deleteComplaint(id: number): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'لن تتمكن من استرجاع هذه الشكوى',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.complaintService.deleteComplaint(id).subscribe({
          next: () => {
            Swal.fire('تم الحذف', 'تم حذف الشكوى بنجاح', 'success');
            this.loadComplaints();
          },
          error: (err) => {
            Swal.fire('خطأ', 'حدث خطأ أثناء الحذف', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  openBlockBrandModal(brandId: number): void {
    this.blockBrandForm.patchValue({ brandId });
    this.showBlockModal = true;
  }

  blockBrand(): void {
    if (this.blockBrandForm.invalid) {
      Swal.fire('تنبيه', 'يرجى ملء جميع الحقول', 'warning');
      return;
    }

    this.loading = true;
    this.complaintService.blockBrand(this.blockBrandForm.value).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('نجح', 'تم حظر البراند بنجاح', 'success');
        this.showBlockModal = false;
        this.blockBrandForm.reset();
        this.loadBlockedBrands();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire('خطأ', 'حدث خطأ أثناء الحظر', 'error');
        console.error(err);
      }
    });
  }

  unblockBrand(brandId: number): void {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: 'سيتم إلغاء حظر هذا البراند',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        this.complaintService.unblockBrand(brandId).subscribe({
          next: () => {
            Swal.fire('نجح', 'تم إلغاء الحظر بنجاح', 'success');
            this.loadBlockedBrands();
             this.loadComplaints();
          },
          error: (err) => {
            Swal.fire('خطأ', 'حدث خطأ', 'error');
            console.error(err);
          }
        });
      }
    });
  }

  getStatusValue(status: string): number {
    const map: any = {
      'Pending': 1,
      'UnderReview': 2,
      'Resolved': 3,
      'Rejected': 4
    };
    return map[status] || 1;
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