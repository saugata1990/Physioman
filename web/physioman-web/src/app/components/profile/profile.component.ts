import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewChecked {

  private patient = new Patient();
  private loggedIn = false;
  private hasBooking = false;
  private hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.checkState();
    this.patientService.viewProfile()
    .subscribe(
      response => {
        this.patient.populate(response);
      },
      error => {
        console.log('error occured');
      }
    );
  }

  ngAfterViewChecked() {
    this.checkState();
  }

  checkState() {
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
    });
  }


  viewBookingStatus() {
    console.log('booking status');
  }

  viewOrders() {
    console.log('orders');
  }

  bookPhysio() {
    console.log('book physio');
  }

  viewItems() {
    console.log('Shop');
  }

}
