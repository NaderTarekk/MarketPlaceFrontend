import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ShippingEmployeeComponent } from './components/shipping-employee/shipping-employee.component';
import { ShippingRoutingModule } from '../../routing/shipping-routing.module';
import { ShippingService } from './services/shipping.service';
import { VendorShippingComponent } from './components/vendor-shipping/vendor-shipping.component';
import { DeliveryAgentComponent } from './components/delivery-agent/delivery-agent.component';
import { ShipmentTrackingComponent } from './components/shipment-tracking/shipment-tracking.component';

@NgModule({
  declarations: [
    ShippingEmployeeComponent,
    ShipmentTrackingComponent,
    VendorShippingComponent,
    DeliveryAgentComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ShippingRoutingModule
  ],
  providers: [ShippingService]
})
export class ShippingModule { }