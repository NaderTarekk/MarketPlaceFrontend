import { Component, OnInit } from '@angular/core';
import { ReturnService } from '../../services/return-service';
import { ReturnStatus } from '../../../../models/return';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-agent-return-tasks',
  standalone: false,
  templateUrl: './agent-return-tasks.component.html',
  styleUrls: ['./agent-return-tasks.component.css']
})
export class AgentReturnTasksComponent implements OnInit {
  tasks: any[] = [];
  loading = false;
  ReturnStatus = ReturnStatus;
  activeTab: 'pending' | 'completed' = 'pending';

  constructor(
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.returnService.getAgentTasks().subscribe({
      next: (res: any) => {
        this.tasks = res.data || res || [];
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ في تحميل المهام');
        this.loading = false;
      }
    });
  }

  get pendingTasks(): any[] {
    return this.tasks.filter(t => t.status === ReturnStatus.PickupScheduled);
  }

  get completedTasks(): any[] {
    return this.tasks.filter(t => t.status >= ReturnStatus.PickedUp);
  }

  confirmPickup(returnId: number): void {
    if (!confirm('تأكيد استلام المنتج من العميل؟')) return;
    
    this.returnService.confirmPickup(returnId).subscribe({
      next: () => {
        this.toastr.success('تم تأكيد الاستلام بنجاح');
        this.loadTasks();
      },
      error: () => this.toastr.error('حدث خطأ')
    });
  }

  deliverToWarehouse(returnId: number): void {
    if (!confirm('تأكيد تسليم المنتج للمخزن؟')) return;
    
    this.returnService.deliverToWarehouse(returnId).subscribe({
      next: () => {
        this.toastr.success('تم التسليم للمخزن بنجاح');
        this.loadTasks();
      },
      error: () => this.toastr.error('حدث خطأ')
    });
  }

  callCustomer(phone: string): void {
    window.location.href = `tel:${phone}`;
  }

  openMap(address: string): void {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  }
}