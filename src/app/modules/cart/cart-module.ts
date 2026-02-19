import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './components/cart/cart.component';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { CartRoutingModule } from '../../routing/cart-routing.module';
import { OrderComponent } from './components/order/order.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentCancelComponent } from './components/payment-cancel/payment-cancel.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';



@NgModule({
  declarations: [
    CartComponent,
    OrderComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent,
    MyOrdersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CartRoutingModule
  ],providers: [
    CartService
  ]
})
export class CartModule { }
