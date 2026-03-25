import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from '../modules/adamin/components/admin/admin.component';
import { AdminComplaintsComponent } from '../modules/adamin/components/admin-complaints/admin-complaints.component';
import { GovernoratesComponent } from '../modules/adamin/components/governorates/governorates.component';
import { AdminBannersComponent } from '../modules/adamin/components/admin-banners/admin-banners.component';
import { AdminReturnDetailsComponent } from '../modules/adamin/components/admin-return-details/admin-return-details.component';
import { AdminReturnsComponent } from '../modules/adamin/components/admin-returns/admin-returns.component';
import { AdminReturnStatisticsComponent } from '../modules/adamin/components/admin-return-statistics-component/admin-return-statistics-component.component';

const routes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'complaints', component: AdminComplaintsComponent },
  { path: 'governorates', component: GovernoratesComponent },
  { path: 'banners', component: AdminBannersComponent },
  { path: 'returns', component: AdminReturnsComponent },
  { path: 'returns/:id', component: AdminReturnDetailsComponent },
  { path: 'return-statistics', component: AdminReturnStatisticsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
