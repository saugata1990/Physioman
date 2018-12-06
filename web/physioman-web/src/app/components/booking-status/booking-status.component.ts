import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { BookingStatus } from '../../models/booking_status';

@Component({
  selector: 'app-booking-status',
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.css']
})
export class BookingStatusComponent implements OnInit {

  private booking_data;
  private loaded = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.patientService.getBookingStatus()
    .subscribe(
      response => {
        this.booking_data = response;
        this.loaded = true;
      },
      error => console.log(error)
    );
  }

}
