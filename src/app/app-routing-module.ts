import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes = [
  // {
  //   path: 'admin',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['Admin'] },   // 👈 هنا
  //   loadChildren: () =>
  //     import('./features/admin/admin.module').then(m => m.AdminModule)
  // },
  // {
  //   path: 'merchant',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['Merchant'] }, // 👈 هنا
  //   loadChildren: () =>
  //     import('./features/merchant/merchant.module').then(m => m.MerchantModule)
  // }
{}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
