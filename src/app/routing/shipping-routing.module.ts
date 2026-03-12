import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryAgentComponent } from '../modules/shipping/components/delivery-agent/delivery-agent.component';
import { ShipmentTrackingComponent } from '../modules/shipping/components/shipment-tracking/shipment-tracking.component';
import { ShippingEmployeeComponent } from '../modules/shipping/components/shipping-employee/shipping-employee.component';
import { VendorShippingComponent } from '../modules/shipping/components/vendor-shipping/vendor-shipping.component';
import { WarehouseManagementComponent } from '../modules/shipping/components/warehouse-management/warehouse-management.component';

const routes: Routes = [
   { path: 'employee', component: ShippingEmployeeComponent },
    { path: 'agent', component: DeliveryAgentComponent },
    { path: 'vendor', component: VendorShippingComponent },
    { path: 'track/:barcode', component: ShipmentTrackingComponent },
    { path: 'warehouse', component: WarehouseManagementComponent },
    { path: '', redirectTo: 'employee', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingRoutingModule {}