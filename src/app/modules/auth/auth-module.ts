import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component/login.component';
import { SharedModule } from '../../shared/shared-module';
import { AuthRoutingModule } from '../../routing/auth-routing.module';



@NgModule({
  declarations: [
    LoginComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AuthModule { }
