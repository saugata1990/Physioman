import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { HASBOOKING } from '../../store/actions/actions';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {

  paymentMode;
  genderPreference;
  bookingPrice = 100;  // this value should be read from the database
  onlinePaymentPending = false;
  onlinePaymentSuccess = false;
  hasWalletBalance = false;
  cardPayment = false;
  // @ViewChild('submit') submit: ElementRef;

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    // fetch booking price from database
    // TBD......

    this.patientService.checkWalletBalance(this.bookingPrice)
    .subscribe(response => this.hasWalletBalance = true, error => this.hasWalletBalance = false);
  }

  openCardPayment() {
    $(document).ready(() => {
      if (this.paymentMode === 'card') {
        // @ts-ignore
        $('#payment').modal('show');
      }
    });
  }

  onPaymentCompletion(event, form) {
    console.log('event fired and accepted ', event);
    $(document).ready(() => {
      // @ts-ignore
      $('#payment').modal('hide');
    });
    this.onlinePaymentSuccess = event === 'success' ? true : false;
    if (this.onlinePaymentSuccess) {
      this.createBooking(form);
    }
  }

  onBookingRequest(form) {
    if (this.paymentMode === 'card') {
      this.openCardPayment();
    } else {
      this.createBooking(form);
    }
  }

  createBooking(form) {
    // if (this.paymentMode === 'card') {
    //   this.openCardPayment();
    // }

    this.patientService.requestBooking(form.value.ailment, this.genderPreference, this.paymentMode)
    .subscribe(
      (response: any) => {
        console.log(response);
        this.toastr.successToastr('Thank you for booking with us. We will get back to you shortly');
        if (this.paymentMode === 'wallet') {
          this.patientService.payWithWallet(this.bookingPrice).subscribe(response2 => {
            this.patientService.updateState({action: HASBOOKING});
            this.router.navigate(['/booking-status']);
          });
        } else {
          this.patientService.updateState({action: HASBOOKING});
          this.router.navigate(['/booking-status']);
        }

      },
      error => {
        console.log(error);
      }
    );
  }


}
