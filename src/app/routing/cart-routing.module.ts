import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from '../modules/cart/components/cart/cart.component';
import { OrderComponent } from '../modules/cart/components/order/order.component';
import { PaymentCancelComponent } from '../modules/cart/components/payment-cancel/payment-cancel.component';
import { PaymentSuccessComponent } from '../modules/cart/components/payment-success/payment-success.component';
import { MyOrdersComponent } from '../modules/cart/components/my-orders/my-orders.component';
import { BarcodeScannerComponent } from '../modules/cart/components/barcode-scanner/barcode-scanner.component';

const routes: Routes = [
  { path: '', component: CartComponent },
  { path: 'checkout', component: OrderComponent },
  { path: 'my-orders', component: MyOrdersComponent },
  { path: 'success', component: PaymentSuccessComponent },
  { path: 'cancel', component: PaymentCancelComponent },
  { path: 'scan-barcode', component: BarcodeScannerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
