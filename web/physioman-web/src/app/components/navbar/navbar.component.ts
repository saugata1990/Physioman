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
  private loggedIn = false;
  private hasBooking = false;
  private hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.checkState();
  }



  checkState() {
    // if (localStorage.getItem('patientToken')) {
    //   this.patientService.updateState({action: LOGGEDIN});
    // }
    // if (localStorage.getItem('bookingActive')) {
    //   this.patientService.updateState({action: HASBOOKING});
    // }
    // if (localStorage.getItem('orderActive')) {
    //   this.patientService.updateState({action: HASORDERED});
    // }
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
      console.log(state);
    });
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
