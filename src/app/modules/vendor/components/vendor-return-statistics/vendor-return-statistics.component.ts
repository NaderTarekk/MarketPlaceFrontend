import { Component, OnInit } from '@angular/core';
import { ReturnStatistics, ReturnReasonLabels } from '../../../../models/return';
import { ReturnService } from '../../../shipping/services/return-service';

@Component({
  selector: 'app-vendor-return-statistics',
  standalone: false,
  templateUrl: './vendor-return-statistics.component.html',
  styleUrl: './vendor-return-statistics.component.css',
})
export class VendorReturnStatisticsComponent implements OnInit {
  stats!: ReturnStatistics;
  loading = false;
  reasonLabels = ReturnReasonLabels;
 
  constructor(private returnService: ReturnService) {}
 
  ngOnInit(): void {
    this.loadStatistics();
  }
 
  loadStatistics(): void {
    this.loading = true;
    this.returnService.getVendorStatistics().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
        }
        this.loading = false;
      }
    });
  }
 
  getReasonLabel(key: string): string {
    return this.reasonLabels[+key] || 'غير معروف';
  }
}
