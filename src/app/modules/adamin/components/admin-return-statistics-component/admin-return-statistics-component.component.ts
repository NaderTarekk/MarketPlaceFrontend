import { Component, OnInit } from '@angular/core';
import { ReturnService } from '../../../shipping/services/return-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-return-statistics',
  standalone: false,
  templateUrl: './admin-return-statistics-component.component.html',
  styleUrls: ['./admin-return-statistics-component.component.css']
})
export class AdminReturnStatisticsComponent implements OnInit {
  stats: any;
  loading = false;
  dateFrom: string = '';
  dateTo: string = '';

  constructor(
    private returnService: ReturnService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = lastMonth.toISOString().split('T')[0];
    
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    const fromDate = this.dateFrom ? new Date(this.dateFrom) : undefined;
    const toDate = this.dateTo ? new Date(this.dateTo) : undefined;
    
    this.returnService.getStatistics(fromDate, toDate).subscribe({
      next: (res: any) => {
        this.stats = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('حدث خطأ في تحميل الإحصائيات');
        this.loading = false;
      }
    });
  }

  onDateChange(): void {
    if (this.dateFrom && this.dateTo) {
      this.loadStats();
    }
  }
}