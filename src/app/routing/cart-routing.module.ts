import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from '../modules/cart/components/cart/cart.component';
import { OrderComponent } from '../modules/cart/components/order/order.component';
import { PaymentCancelComponent } from '../modules/cart/components/payment-cancel/payment-cancel.component';
import { PaymentSuccessComponent } from '../modules/cart/components/payment-success/payment-success.component';
import { MyOrdersComponent } from '../modules/cart/components/my-orders/my-orders.component';
import { BarcodeScannerComponent } from '../modules/cart/components/barcode-scanner/barcode-scanner.component';
import { MyReturnComponent } from '../modules/cart/components/my-return/my-return.component';
import { CreateReturnComponent } from '../modules/cart/components/create-return/create-return.component';
import { ReturnDetailsComponent } from '../modules/cart/components/return-details/return-details.component';

const routes: Routes = [
  { path: '', component: CartComponent },
  { path: 'checkout', component: OrderComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  { path: 'success', component: PaymentSuccessComponent },
  { path: 'cancel', component: PaymentCancelComponent },
  { path: 'scan-barcode', component: BarcodeScannerComponent },
    { path: 'my-returns', component: MyReturnComponent },
  { path: 'create-return/:orderId', component: CreateReturnComponent },
  { path: 'return-details/:id', component: ReturnDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
