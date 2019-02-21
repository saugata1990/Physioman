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
  gender;
  otp;
  phone;
  phoneVerified = false;
  location;

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    this.location = {lat: 10.001, long: 0.003};
  }

  sendVerificationCode(form) {
    console.log('gender ', this.gender);
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
    }, error => {
      this.toastr.errorToastr(error.error.message);
      console.log(error);
    });
  }

  signup(form) {
    this.patientService.signup(form.value.phone, form.value.password, form.value.name, form.value.gender, this.location)
    .subscribe(
      response => {
        this.signedUp = true;
        this.toastr.successToastr('Signed up successfully', 'Success!', {position: 'top-center'});
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error => {
        this.toastr.errorToastr(error.error.message);
        console.log(error.error.message);
      }
    );
  }
}
