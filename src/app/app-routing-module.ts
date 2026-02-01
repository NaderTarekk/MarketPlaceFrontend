import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/auth/login.component/login.component';
import { SignupComponent } from './modules/auth/signup.component/signup.component';
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

  // Admin routes (lazy loaded)
  // {
  //   path: 'admin',
  //   canActivate: [RoleGuard],
  //   data: { roles: ['Admin'] },
  //   loadChildren: () =>
  //     import('./features/admin/admin.module').then(m => m.AdminModule)
  // },

  // Catch-all
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }