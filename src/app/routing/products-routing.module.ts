import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from '../modules/products/components/products/products.component';
import { ProductDetailsComponent } from '../modules/products/components/product-details/product-details.component';
import { AdminReviewComponent } from '../modules/products/components/admin-review/admin-review.component';
import { WishlistsComponent } from '../modules/products/components/wishlists/wishlists.component';
import { MyReviewsComponent } from '../modules/products/components/my-reviews/my-reviews.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'reviews', component: AdminReviewComponent },
  { path: 'wishlist', component: WishlistsComponent },
  { path: 'my-reviews', component: MyReviewsComponent },
  { path: 'category/:id', component: ProductsComponent },
  { path: ':id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }