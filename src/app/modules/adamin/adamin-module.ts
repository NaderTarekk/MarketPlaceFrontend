import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './components/admin/admin.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from '../../routing/admin-routing-module';
import { AdminComplaintsComponent } from './components/admin-complaints/admin-complaints.component';



@NgModule({
  declarations: [
    AdminComponent,
    AdminComplaintsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    ReactiveFormsModule
  ]
})
export class AdaminModule { }
