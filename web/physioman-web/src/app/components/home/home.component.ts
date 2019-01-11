import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;

  constructor(private patientService: PatientService) { }

  ngOnInit() {
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

}
