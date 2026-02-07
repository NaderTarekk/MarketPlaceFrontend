import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandsRoutingModule } from '../../routing/brands-routing-module';
import { BrandComponent } from './components/brand/brand.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';



@NgModule({
  declarations: [
    BrandComponent
  ],
  imports: [
    CommonModule,
    BrandsRoutingModule,
    FormsModule,
    SharedModule
  ]
})
export class BrandsModule { }
