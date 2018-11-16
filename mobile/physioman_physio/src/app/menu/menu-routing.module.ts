import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuPage } from './menu.page';
import { DashboardPage } from '../dashboard/dashboard.page';
import { ProcessAppointmentPage } from '../process-appointment/process-appointment.page';
import { ProcessBookingPage } from '../process-booking/process-booking.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/menu/(menucontent:dashboard)',
    pathMatch: 'full'
  },
  { path: 'menu',
    component: MenuPage,
    children: [
      { path: 'dashboard', outlet: 'menucontent', component: DashboardPage },
      { path: 'process-appointment', outlet: 'menucontent', component: ProcessAppointmentPage },
      { path: 'process-booking', outlet: 'menucontent', component: ProcessBookingPage }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class MenuRoutingModule { }
