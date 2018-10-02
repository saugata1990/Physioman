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

  onLogin(form) {
    this.patientService.login(form.value.phone, form.value.password)
    .subscribe(
      response => {
        localStorage.setItem('patientToken', JSON.stringify(response));
        this.patientService.updateState({
          action: LOGGEDIN
        });
        this.checkBookingsAndOrders();
        this.router.navigate(['/my-profile']);
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
    }, error => {});
    this.patientService.getOrderStatus()
    .subscribe(response => {
      this.patientService.updateState({
        action: HASORDERED
      });
      localStorage.setItem('orderActive', 'true');
    }, error => {});
  }


}
