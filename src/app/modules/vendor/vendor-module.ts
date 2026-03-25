import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorDashboardComponent } from './components/vendor/vendor-dashboard.component';
import { VendorService } from './services/vendor.service';
import { FormsModule } from '@angular/forms';
import { VendorRoutingModule } from '../../routing/vendor-routing.module';
import { SharedModule } from '../../shared/shared-module';
import { VendorReturnsComponent } from './components/vendor-returns/vendor-returns.component';
import { VendorReturnModalComponent } from './components/vendor-return-modal/vendor-return-modal.component';
import { VendorReturnStatisticsComponent } from './components/vendor-return-statistics/vendor-return-statistics.component';



@NgModule({
  declarations: [
    VendorDashboardComponent,
    VendorReturnsComponent,
    VendorReturnModalComponent,
    VendorReturnStatisticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    VendorRoutingModule
  ],
  providers: [
    VendorService
  ]
})
export class VendorModule { }
