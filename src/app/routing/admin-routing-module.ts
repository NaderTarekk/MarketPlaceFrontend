import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../modules/adamin/components/admin/admin.component';
import { AdminComplaintsComponent } from '../modules/adamin/components/admin-complaints/admin-complaints.component';

const routes: Routes = [
  {path: '', component: AdminComponent},
  {path: 'complaints', component: AdminComplaintsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
