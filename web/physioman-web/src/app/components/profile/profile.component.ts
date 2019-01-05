import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewChecked {

  patient;
  loaded = false;
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.checkState();
    this.patientService.viewProfile()
    .subscribe(
      response => {
        this.patient = (response as any).patient;
        this.loaded = true;
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
      // this.hasBooking = state.hasBooking;
      // this.hasOrdered = state.hasOrdered;
    });
  }




}
