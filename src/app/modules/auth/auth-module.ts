import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from '../../routing/auth-routing.module';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component/login.component';
import { SignupComponent } from './signup.component/signup.component';
import { ForgotPasswordComponent } from './forgot-password.component/forgot-password.component';



@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule
  ]
})
export class AuthModule { }
