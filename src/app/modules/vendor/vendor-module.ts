import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorDashboardComponent } from './components/vendor/vendor-dashboard.component';
import { VendorService } from './services/vendor.service';
import { FormsModule } from '@angular/forms';
import { VendorRoutingModule } from '../../routing/vendor-routing.module';
import { SharedModule } from '../../shared/shared-module';



@NgModule({
  declarations: [
    VendorDashboardComponent
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
