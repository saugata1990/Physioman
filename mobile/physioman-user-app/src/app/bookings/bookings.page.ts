import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit {

  booking_data;
  loaded = false;

  constructor(private apiService: ApiService, private dataService: DataService,
    private router: Router) { }

  ngOnInit() {
    this.getBookingData();
  }

  getBookingData() {
    this.apiService.getBookingStatus(this.dataService.patientToken)
    .subscribe(data => {
      this.booking_data = (data as any).booking;
      if (this.booking_data.assigned_consultant) {
        this.apiService.getConsultantName(this.booking_data.assigned_consultant, this.dataService.patientToken)
        .subscribe(data2 => {
          this.booking_data.consultant_name = (data2 as any).consultant.consultant_name;
          if (this.booking_data.assigned_physio) {
            this.apiService.getPhysioName(this.booking_data.assigned_physio, this.dataService.patientToken)
            .subscribe(data3 => {
              this.booking_data.physio_name = (data3 as any).physio.physio_name;
              if (this.booking_data.session_status === 'otp sent') {
                this.apiService.getOTP(this.dataService.patientToken)
                .subscribe(data4 => {
                  this.booking_data.session_otp = (data4 as any).otp;
                  this.loaded = true;
                });
              } else {
                this.loaded = true;
              }
            });
          } else {
            this.loaded = true;
          }
        });
      } else {
        this.loaded = true;
      }
    }, error => {});
  }

  onUnlockSessions() {
    console.log('TODO');
  }

  showPersonnelDetails() {
    console.log('TODO');
  }

}
