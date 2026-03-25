// ============================================================================
// 📁 modules/cart/components/create-return/create-return.component.ts
// ============================================================================

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { ReturnReason, CreateReturnRequest } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-create-return',
  standalone: false,
  templateUrl: './create-return.component.html',
  styleUrls: ['./create-return.component.css'] // ✅ Changed to .css or remove entirely
})
export class CreateReturnComponent implements OnInit {
  orderId!: number;
  order: any;
  returnForm!: FormGroup;
  loading = false;
  submitting = false;
  canReturn = false;
  canReturnMessage = '';

  reasons = [
    { value: ReturnReason.DamagedProduct, label: 'منتج تالف' },
    { value: ReturnReason.WrongProduct, label: 'منتج غلط' },
    { value: ReturnReason.NotSatisfied, label: 'غير راضي عن المنتج' },
    { value: ReturnReason.NotAsDescribed, label: 'لم يطابق الوصف' }
  ];

  uploadedImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private returnService: ReturnService,
    private orderService: OrderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.orderId = +this.route.snapshot.params['orderId'];
    this.initForm();
    this.checkCanReturn();
    this.loadOrder();
  }

  initForm(): void {
    this.returnForm = this.fb.group({
      reason: [null, Validators.required],
      reasonDetails: [''],
      items: this.fb.array([], Validators.required)
    });
  }

  get itemsArray(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  checkCanReturn(): void {
    this.returnService.canOrderBeReturned(this.orderId).subscribe({
      next: (res: any) => {
        this.canReturn = res.data ?? res.success;
        this.canReturnMessage = res.message || '';
      },
      error: () => {
        this.canReturn = false;
        this.canReturnMessage = 'حدث خطأ في التحقق';
      }
    });
  }

  loadOrder(): void {
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (res: any) => {
        this.order = res.data || res;
        this.initItemsArray();
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ في تحميل الطلب');
        this.loading = false;
      }
    });
  }

  initItemsArray(): void {
    while (this.itemsArray.length) {
      this.itemsArray.removeAt(0);
    }

    const items = this.order.items || this.order.orderItems || [];

    items.forEach((item: any) => {
      this.itemsArray.push(this.fb.group({
        orderItemId: [item.id],
        productName: [item.productNameAr || item.productName || item.product?.nameAr],
        productImage: [item.productImage || item.product?.mainImage || item.imageUrl],
        maxQuantity: [item.quantity],
        quantity: [0],
        selected: [false]
      }));
    });
  }

  toggleItem(index: number): void {
    const item = this.itemsArray.at(index);
    const selected = item.get('selected')?.value;
    if (!selected) {
      item.patchValue({ quantity: item.get('maxQuantity')?.value });
    } else {
      item.patchValue({ quantity: 0 });
    }
    item.patchValue({ selected: !selected });
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.uploadedImages.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
  }

  submit(): void {
    if (this.returnForm.invalid) {
      this.toastr.warning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const selectedItems = this.itemsArray.controls
      .filter(c => c.get('selected')?.value && c.get('quantity')?.value > 0)
      .map(c => ({
        orderItemId: c.get('orderItemId')?.value,
        quantity: c.get('quantity')?.value
      }));

    if (selectedItems.length === 0) {
      this.toastr.warning('يرجى اختيار منتج واحد على الأقل');
      return;
    }

    const dto: CreateReturnRequest = {
      orderId: this.orderId,
      reason: this.returnForm.value.reason,
      reasonDetails: this.returnForm.value.reasonDetails,
      images: this.uploadedImages,
      items: selectedItems
    };

    this.submitting = true;
    this.returnService.createReturnRequest(dto).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toastr.success('تم إنشاء طلب الإرجاع بنجاح');
          const returnId = res.data?.id || res.id;
          this.router.navigate(['/returns', returnId]);
        } else {
          this.toastr.error(res.message || 'حدث خطأ');
        }
        this.submitting = false;
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'حدث خطأ');
        this.submitting = false;
      }
    });
  }
}