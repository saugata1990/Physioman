import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LOGGEDIN, HASBOOKING, HASORDERED } from '../../store/actions/actions';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
  }

  getPayUMoneyAuth() {
    this.patientService.getPayUAuth()
    .subscribe(auth => {
      const key = (auth as any).auth;
      localStorage.setItem('payumoney-auth', key);
    });
  }

  onPasswordReset() {
    $(document).ready(() => {
      // @ts-ignore
      $('#pwdreset').modal('show');
    });
  }

  resetPassword(frm) {
    $(document).ready(() => {
      $('#pwdreset').on('hidden.bs.modal', () => {
        this.patientService.resetPassword(frm.value.phone, frm.value.name)
        .subscribe(response => {
          this.toastr.successToastr('Password has been reset and sent to you');
          console.log(response);
        }, error => {
          this.toastr.errorToastr('Wrong phone number or name');
          console.log(error);
        });
      });
      // @ts-ignore
      $('#pwdreset').modal('hide');
    });
  }

  onLogin(form) {
    this.patientService.login(form.value.phone, form.value.password)
    .subscribe(
      response => {
        localStorage.setItem('patientToken', JSON.stringify(response));
        this.patientService.updateState({
          action: LOGGEDIN
        });
        this.checkBookingsAndOrders();
        this.getPayUMoneyAuth();
        this.router.navigate(['/user/profile']);
      },
      error => {
        this.toastr.errorToastr('Incorrect username/password', 'Error!', {position: 'bottom-center'});
        console.log('incorrect username/password');
      }
    );
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
    }, error => console.log(error));
  }


}
