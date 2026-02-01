import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardModule } from '../product-card/product-card-module';
import { HomeComponent } from './home.component';



@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ProductCardModule
  ]
})
export class HomeModule { }
