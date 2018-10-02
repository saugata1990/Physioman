import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProcessAppointmentPage } from './process-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: ProcessAppointmentPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProcessAppointmentPage],

})
export class ProcessAppointmentPageModule {}
