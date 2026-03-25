import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './components/cart/cart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { CartRoutingModule } from '../../routing/cart-routing.module';
import { OrderComponent } from './components/order/order.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { BarcodeScannerComponent } from './components/barcode-scanner/barcode-scanner.component';
import { MyReturnComponent } from './components/my-return/my-return.component';
import { CreateReturnComponent } from './components/create-return/create-return.component';
import { ReturnDetailsComponent } from './components/return-details/return-details.component';



@NgModule({
  declarations: [
    CartComponent,
    OrderComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent,
    MyOrdersComponent,
    BarcodeScannerComponent,
    MyReturnComponent,
    CreateReturnComponent,
    ReturnDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CartRoutingModule,
    ReactiveFormsModule
  ],providers: [
    CartService
  ]
})
export class CartModule { }
