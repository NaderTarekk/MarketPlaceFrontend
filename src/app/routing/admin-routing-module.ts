import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../modules/adamin/components/admin/admin.component';
import { AdminComplaintsComponent } from '../modules/adamin/components/admin-complaints/admin-complaints.component';
import { GovernoratesComponent } from '../modules/adamin/components/governorates/governorates.component';
import { AdminBannersComponent } from '../modules/adamin/components/admin-banners/admin-banners.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'complaints', component: AdminComplaintsComponent },
  { path: 'governorates', component: GovernoratesComponent },
  { path: 'banners', component: AdminBannersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
