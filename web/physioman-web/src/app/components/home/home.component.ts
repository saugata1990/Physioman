import { Component, OnInit, ViewChild, AfterViewChecked, HostListener, ElementRef } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewChecked {
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;
  subscription;
  @ViewChild('frm') formValues;


  constructor(private patientService: PatientService, private toastr: ToastrManager, private location: Location) { }

  ngOnInit() {
    this.checkState();
  }

  ngAfterViewChecked() {
    const pathWithoutHash = this.location.path(false);
    this.location.replaceState(pathWithoutHash);
  }



  showModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#query').modal('show');
    });
  }

  closeModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#query').click().modal('hide');
    });
  }

  onQuerySubmitted(frm) {
    $(document).ready(() => {
      this.patientService.postQuery(frm.value.name, frm.value.phone, frm.value.query)
        .subscribe(response => {
          this.toastr.successToastr('Your query has been posted. We will get back to you shortly', 'Success!');
          this.formValues.reset();
          console.log(response);
        });
      });
      // @ts-ignore
      $('#query').modal('hide');
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
