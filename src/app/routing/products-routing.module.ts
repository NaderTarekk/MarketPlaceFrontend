import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from '../modules/products/components/products/products.component';
import { ProductDetailsComponent } from '../modules/products/components/product-details/product-details.component';
import { AdminReviewComponent } from '../modules/products/components/admin-review/admin-review.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'reviews', component: AdminReviewComponent },
  { path: 'category/:id', component: ProductsComponent },
  { path: ':id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule {}