import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './components/cart/cart.component';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { CartRoutingModule } from '../../routing/cart-routing.module';



@NgModule({
  declarations: [
    CartComponent
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
