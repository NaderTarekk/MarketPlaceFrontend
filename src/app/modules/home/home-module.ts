import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardModule } from '../product-card/product-card-module';
import { HomeComponent } from './home.component';
import { AppRoutingModule } from "../../app-routing-module";
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ProductCardModule,
    AppRoutingModule,
    FormsModule
]
})
export class HomeModule { }
