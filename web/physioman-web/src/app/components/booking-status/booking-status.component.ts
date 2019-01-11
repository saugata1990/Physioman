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

  booking_data;
  loaded = false;
  numSessions;
  amount_to_pay;
  online_payment_needed = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    this.getBookingData();
  }

  getBookingData() {
    this.patientService.getBookingStatus()
    .subscribe(
      response => {
        this.booking_data = (response as any).booking;
        if (this.booking_data.assigned_consultant) {
          this.patientService.getConsultantName(this.booking_data.assigned_consultant)
          .subscribe(response2 => {
            this.booking_data.consultant_name = (response2 as any).consultant.consultant_name;
            if (this.booking_data.assigned_physio) {
              this.patientService.getPhysioName(this.booking_data.assigned_physio)
              .subscribe(response3 => {
                this.booking_data.physio_name = (response3 as any).physio.physio_name;
                if (this.booking_data.session_status === 'otp sent') {
                  this.patientService.getOTP()
                  .subscribe(response4 => {
                    this.booking_data.session_otp = (response4 as any).otp;
                    this.loaded = true;
                    console.log(this.booking_data);
                  });
                } else {
                  this.loaded = true;
                  console.log(this.booking_data);
                }
              });
            } else {
              this.loaded = true;
              console.log(this.booking_data);
            }
          });
        } else {
          this.loaded = true;
          console.log(this.booking_data);
        }
      },
      error => console.log(error)
    );
  }

  openModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#bookSessions').modal('show');
    });
  }

  hideModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#bookSessions').modal('hide');
    });
  }

  openPaymentModal() {
    $(document).ready(() => {
      $('#bookSessions').on('hidden.bs.modal', () => {
        // @ts-ignore
        $('#payment').modal('show');
      });
      // @ts-ignore
      $('#bookSessions').modal('hide');
    });
  }

  onSessionsSet() {
    this.amount_to_pay = this.numSessions * this.booking_data.session_fee;
    this.patientService.checkWalletBalance(this.amount_to_pay)
    .subscribe(response => {
      this.patientService.payWithWallet(this.amount_to_pay)
      .subscribe(response2 => {
        this.patientService.unlockSessions(this.booking_data._id, this.numSessions)
        .subscribe(response3 => {
          console.log('sessions unlocked');
          this.getBookingData();
          this.hideModal();
        });
      });
    }, error => {
      this.openPaymentModal();
      this.online_payment_needed = true;
    });
  }

  onPaymentCompletion(event) {
    this.patientService.unlockSessions(this.booking_data._id, this.numSessions)
        .subscribe(response3 => {
          console.log('sessions unlocked');
          this.getBookingData();
        });
  }

}
