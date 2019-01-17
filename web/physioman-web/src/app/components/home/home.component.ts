import { Component, OnInit, ViewChild } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;
  @ViewChild('frm') formValues;

  constructor(private patientService: PatientService, private toastr: ToastrManager) { }

  ngOnInit() {
    this.checkState();
  }

  onQuery() {
    $(document).ready(() => {
      // @ts-ignore
      $('#query').modal('show');
    });
  }

  onQuerySubmitted(frm) {
    $(document).ready(() => {
      $('#query').on('hidden.bs.modal', () => {
        this.patientService.postQuery(frm.value.name, frm.value.phone, frm.value.query)
        .subscribe(response => {
          this.toastr.warningToastr('Your query has been posted. We will get back to you shortly', 'Success!');
          this.formValues.reset();
          console.log(response);
        });
      });
      // @ts-ignore
      $('#query').modal('hide');
    });
  }


  checkState() {
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
    });
  }

}
