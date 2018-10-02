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
  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
  }

  onSignup(form) {
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
