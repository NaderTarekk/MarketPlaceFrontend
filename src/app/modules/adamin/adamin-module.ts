import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './components/admin/admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from '../../routing/admin-routing-module';
import { AdminComplaintsComponent } from './components/admin-complaints/admin-complaints.component';
import { GovernoratesComponent } from './components/governorates/governorates.component';
import { AdminBannersComponent } from './components/admin-banners/admin-banners.component';
import { AdminReturnsComponent } from './components/admin-returns/admin-returns.component';
import { AdminReturnDetailsComponent } from './components/admin-return-details/admin-return-details.component';
import { AdminReturnStatisticsComponent } from './components/admin-return-statistics-component/admin-return-statistics-component.component';
import { SupportSetupComponent } from './components/support-setup/support-setup.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';



@NgModule({
  declarations: [
    AdminComponent,
    AdminComplaintsComponent,
    GovernoratesComponent,
    AdminBannersComponent,
    AdminReturnsComponent,
    AdminReturnDetailsComponent,
    AdminReturnStatisticsComponent,
    SupportSetupComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdaminModule { }
