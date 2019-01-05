import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LOGGEDOUT, LOGGEDIN, HASBOOKING, HASORDERED } from '../../store/actions/actions';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;
  name;


  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.checkBookingsAndOrders();
    this.checkState();
  }



  checkState() {
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
      if (this.loggedIn) {
        this.patientService.viewProfile()
        .subscribe(response => this.name = (response as any).patient.patient_name.split(' ')[0]);
      }
    });
  }

  checkBookingsAndOrders() {
    this.patientService.getBookingStatus()
    .subscribe(response => {
      this.patientService.updateState({
        action: HASBOOKING
      });
      localStorage.setItem('bookingActive', 'true');
    }, error => console.log(error));
    this.patientService.getOrderStatus()
    .subscribe(response => {
      this.patientService.updateState({
        action: HASORDERED
      });
      localStorage.setItem('orderActive', 'true');
    }, error => console.log(error));
  }



  onLogout() {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('bookingActive');
    localStorage.removeItem('orderActive');
    this.patientService.updateState({ action: LOGGEDOUT });
    this.router.navigate(['/']);
    alert('You are logged out');
  }


}
