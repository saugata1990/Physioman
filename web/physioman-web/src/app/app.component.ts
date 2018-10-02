import { Component, OnInit } from '@angular/core';
import { PatientService } from './services/patient.service';
import { LOGGEDIN, HASBOOKING, HASORDERED } from './store/actions/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'physioman';

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    if (localStorage.getItem('patientToken')) {
      this.patientService.updateState({action: LOGGEDIN});
    }
    if (localStorage.getItem('bookingActive')) {
      this.patientService.updateState({action: HASBOOKING});
    }
    if (localStorage.getItem('orderActive')) {
      this.patientService.updateState({action: HASORDERED});
    }
  }

}
