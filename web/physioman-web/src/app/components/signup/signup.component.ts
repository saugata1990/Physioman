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
  otp;
  phone;
  phoneVerified = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
  }

  sendVerificationCode(form) {
    this.phone = form.value.phone;
    this.patientService.sendOTP(this.phone)
    .subscribe(response => {
      $(document).ready(() => {
        // @ts-ignore
        $('#verification').modal('show');
        console.log(response);
      });
    });
  }

  onOTPEntered(otp) {
    this.patientService.verifyOTP(this.phone, otp)
    .subscribe(response => {
      $(document).ready(() => {
        // @ts-ignore
        $('#verification').modal('hide');
        console.log(response);
        this.phoneVerified = true;
      });
    }, error => console.log(error));
  }

  onSignup(form) {
    if (!this.phoneVerified) {
      alert('Verify phone first');
    } else {
      this.patientService.signup(form.value.phone, form.value.password, form.value.name, form.value.email, form.value.gender,
                              form.value.dob, form.value.address, form.value.ailment)
      .subscribe(
        response => {
          this.signedUp = true;
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
}
