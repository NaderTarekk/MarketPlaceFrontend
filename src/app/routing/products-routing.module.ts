import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from '../modules/products/components/products/products.component';
import { ProductDetailsComponent } from '../modules/products/components/product-details/product-details.component';
import { AdminReviewComponent } from '../modules/products/components/admin-review/admin-review.component';
import { WishlistsComponent } from '../modules/products/components/wishlists/wishlists.component';
import { MyReviewsComponent } from '../modules/products/components/my-reviews/my-reviews.component';
import { StoresComponent } from '../modules/products/components/stores/stores.component';
import { PromotionDetailComponent } from '../modules/products/components/promotion-detail/promotion-detail.component';

const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'stores', component: StoresComponent },
  { path: 'reviews', component: AdminReviewComponent },
  { path: 'wishlist', component: WishlistsComponent },
  { path: 'my-reviews', component: MyReviewsComponent },
  { path: 'category/:id', component: ProductsComponent },
  { path: 'promotion/:id', component: PromotionDetailComponent },
  { path: ':id', component: ProductDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }