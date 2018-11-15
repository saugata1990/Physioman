import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MenuPage } from './menu.page';

import { MenuRoutingModule } from './menu-routing.module';
import { DashboardPageModule } from '../dashboard/dashboard.module';
import { ProcessAppointmentPageModule } from '../process-appointment/process-appointment.module';
import { ProcessBookingPageModule } from '../process-booking/process-booking.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuRoutingModule,
    DashboardPageModule,
    ProcessAppointmentPageModule,
    ProcessBookingPageModule
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {}
