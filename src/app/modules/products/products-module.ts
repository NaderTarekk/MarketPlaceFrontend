import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './components/products/products.component';
import { FormsModule } from '@angular/forms';
import { ProductsRoutingModule } from '../../routing/products-routing.module';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { AdminReviewComponent } from './components/admin-review/admin-review.component';



@NgModule({
  declarations: [
    ProductsComponent,
    ProductDetailsComponent,
    AdminReviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
