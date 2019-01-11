import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LOGGEDIN, HASBOOKING, HASORDERED } from '../../store/actions/actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
  }

  getPayUMoneyAuth() {
    this.patientService.getPayUAuth()
    .subscribe(auth => {
      const key = (auth as any).auth;
      localStorage.setItem('payumoney-auth', key);
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
