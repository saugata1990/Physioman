import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { HASBOOKING } from '../../store/actions/actions';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {

  paymentMode;
  bookingPrice = 100;
  onlinePaymentPending = false;
  onlinePaymentSuccess = false;
  @ViewChild('submit') submit: ElementRef;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
  }

  openModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#payment').modal('show');
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
    if (this.paymentMode === 'cash' || this.paymentMode  === 'card' && this.onlinePaymentSuccess) {
      this.patientService.requestBooking(form.value.ailment, form.value.genderPreference, form.value.paymentMode)
      .subscribe(
        response => {
          console.log(response);
          this.patientService.updateState({action: HASBOOKING});
          this.router.navigate(['/booking-status']);
        },
        error => {
          console.log(error);
        }
      );
    } else {
      alert('payment pending');
    }
  }

}
