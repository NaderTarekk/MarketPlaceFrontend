import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/auth/login.component/login.component';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },

  //Auth routes (lazy loaded)
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'brands',
    loadChildren: () =>
      import('./modules/brands/brands-module').then(m => m.BrandsModule)
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./modules/products/products-module').then(m => m.ProductsModule)
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./modules/cart/cart-module').then(m => m.CartModule)
  },
  {
    path: 'vendor',
    loadChildren: () =>
      import('./modules/vendor/vendor-module').then(m => m.VendorModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/adamin/adamin-module').then(m => m.AdaminModule)
  },

  // Admin routes (lazy loaded)
  // {
  //   path: 'admin',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['Admin'] },
  //   loadChildren: () =>
  //     import('./features/admin/admin.module').then(m => m.AdminModule)
  // },

  // Catch-all
  { path: "**", redirectTo: "", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }