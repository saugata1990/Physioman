import { ToastrManager } from 'ng6-toastr-notifications';
import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signedUp = false;
  // password;
  // confirm_password;
  otp;
  phone;
  phoneVerified = false;

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
  }

  sendVerificationCode(form) {
    this.phone = form.value.phone;
    this.patientService.sendOTP(this.phone)
    .subscribe(response => {
      this.toastr.successToastr('OTP has been sent to your phone', 'Check your phone', {position: 'top-center'});
      $(document).ready(() => {
        // @ts-ignore
        $('#verification').modal('show');
        console.log(response);
      });
    });
  }

  onOTPEntered(otp, form) {
    this.patientService.verifyOTP(this.phone, otp)
    .subscribe(response => {
      $(document).ready(() => {
        // @ts-ignore
        $('#verification').modal('hide');
        console.log(response);
        this.phoneVerified = true;
        this.signup(form);
      });
    }, error => console.log(error));
  }

  signup(form) {
    this.patientService.signup(form.value.phone, form.value.password, form.value.name, form.value.gender)
    .subscribe(
      response => {
        this.signedUp = true;
        this.toastr.successToastr('Signed up successfully', 'Success!', {position: 'top-center'});
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error => {
        console.log(error.error.message);
      }
    );
  }
}
