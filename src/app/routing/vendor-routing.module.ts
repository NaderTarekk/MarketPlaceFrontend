import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorDashboardComponent } from '../modules/vendor/components/vendor/vendor-dashboard.component';
import { VendorReturnsComponent } from '../modules/vendor/components/vendor-returns/vendor-returns.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: VendorDashboardComponent },
    { path: 'returns', component: VendorReturnsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorRoutingModule { }
