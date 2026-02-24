import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplaintsComponent } from './components/complaints/complaints.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ComplaintRoutingModule } from '../../routing/complaint-routing-module';



@NgModule({
  declarations: [
    ComplaintsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComplaintRoutingModule
  ]
})
export class ComplaintsModule { }
