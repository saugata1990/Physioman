import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LOGGEDOUT, LOGGEDIN, HASBOOKING, HASORDERED } from '../../store/actions/actions';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;
  name;
  recharge_amount;
  accept_payment = false;

  constructor(private patientService: PatientService, public router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    this.checkBookingsAndOrders();
    this.checkState();
  }



  checkState() {
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
      if (this.loggedIn) {
        this.patientService.viewProfile()
        .subscribe(response => this.name = (response as any).patient.patient_name.split(' ')[0]);
      }
    });
  }

  checkBookingsAndOrders() {
    this.patientService.getBookingStatus()
    .subscribe(response => {
      this.patientService.updateState({
        action: HASBOOKING
      });
      localStorage.setItem('bookingActive', 'true');
    }, error => console.log(error));
    this.patientService.getOrderStatus()
    .subscribe(response => {
      this.patientService.updateState({
        action: HASORDERED
      });
      localStorage.setItem('orderActive', 'true');
    }, error => console.log('No orders yet'));
  }

  onRecharge() {
    $(document).ready(() => {
      // @ts-ignore
      $('#recharge').modal('show');
    });
  }

  onAmountEntered() {
    this.accept_payment = true;
    $(document).ready(() => {
      $('#recharge').on('hidden.bs.modal', () => {
        // @ts-ignore
        $('#payment').modal('show');
      });
      // @ts-ignore
      $('#recharge').click().modal('hide');
    });
  }


  onLogout() {
    localStorage.removeItem('patientToken');
    localStorage.removeItem('bookingActive');
    localStorage.removeItem('orderActive');
    this.patientService.updateState({ action: LOGGEDOUT });
    this.router.navigate(['/']);
    this.toastr.infoToastr('You are logged out!');
  }

  onPaymentCompletion(event) {
    console.log('payment event fired and accepted');
    this.patientService.walletRecharge(this.recharge_amount)
    .subscribe(response => {
      console.log(response);
      this.router.navigate(['/user/profile']);
    });
  }


}
