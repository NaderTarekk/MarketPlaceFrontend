import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { VendorReturn, VendorReturnResponse } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-vendor-return-modal',
  standalone: false,
  templateUrl: './vendor-return-modal.component.html',
  styleUrl: './vendor-return-modal.component.css',
})
export class VendorReturnModalComponent {
@Input() returnRequest!: VendorReturn;
  @Input() action: 'approve' | 'reject' = 'approve';
  @Output() onSubmit = new EventEmitter<void>();
 
  notes = '';
  submitting = false;
 
  constructor(
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}
 
  get modalId(): string {
    return this.action === 'approve' 
      ? `approveModal${this.returnRequest.id}` 
      : `rejectModal${this.returnRequest.id}`;
  }
 
  get isApprove(): boolean {
    return this.action === 'approve';
  }
 
  submit(): void {
    const dto: VendorReturnResponse = {
      returnRequestId: this.returnRequest.id,
      approved: this.isApprove,
      notes: this.notes
    };
 
    this.submitting = true;
    this.returnService.vendorRespond(dto).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success(res.message);
          this.onSubmit.emit();
          // Close modal
          const modal = document.getElementById(this.modalId);
          if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            bsModal?.hide();
          }
        } else {
          this.toastr.error(res.message);
        }
        this.submitting = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ');
        this.submitting = false;
      }
    });
  }
}
