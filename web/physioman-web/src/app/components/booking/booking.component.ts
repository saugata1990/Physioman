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
  bookingPrice = 100;  // this value should be read from the database
  onlinePaymentPending = false;
  onlinePaymentSuccess = false;
  hasWalletBalance = false;
  @ViewChild('submit') submit: ElementRef;

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    // fetch booking price from database
    // TBD......

    this.patientService.checkWalletBalance(this.bookingPrice)
    .subscribe(response => this.hasWalletBalance = true, error => this.hasWalletBalance = false);
  }

  openModal() {
    $(document).ready(() => {
      if (this.paymentMode === 'card') {
        // @ts-ignore
        $('#payment').modal('show');
      }
    });
  }

  onPaymentCompletion(event) {
    console.log('event fired and accepted ', event);
    $(document).ready(() => {
      // @ts-ignore
      $('#payment').modal('hide');
    });
    this.onlinePaymentSuccess = event === 'success' ? true : false;
    if (this.onlinePaymentSuccess) {
      this.submit.nativeElement.click();
    }
  }

  onBookingRequest(form) {
    if (this.paymentMode === 'card' && !this.onlinePaymentSuccess) {
      console.log('payment error');
    } else {
      this.patientService.requestBooking(form.value.ailment, form.value.genderPreference, form.value.paymentMode)
      .subscribe(
        response => {
          console.log(response);
          this.toastr.successToastr((response as any).message);
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

}
