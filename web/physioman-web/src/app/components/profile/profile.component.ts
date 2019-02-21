import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewChecked {

  patient;
  address;
  email;
  dob;
  loaded = false;
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router, private toastr: ToastrManager) { }

  ngOnInit() {
    this.checkState();
    this.loadProfile();
  }

  ngAfterViewChecked() {
    this.checkState();
  }

  openEditModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#edit').modal('show');
    });
  }

  openPasswordChangeModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#pwd').modal('show');
    });
  }

  onPasswordChanged(frm) {
    $(document).ready(() => {
      $('#pwd').on('hidden.bs.modal', () => {
        this.patientService.updatePassword(frm.value.currentpwd, frm.value.newpwd)
        .subscribe(response => {
          console.log(response);
          this.toastr.successToastr('Password changed successfully');
        }, error => {
          console.log(error);
          this.toastr.errorToastr('Your entered password is incorrect');
        });
      });
      // @ts-ignore
      $('#pwd').modal('hide');
    });
  }

  onEdit(form) {
    $(document).ready(() => {
      // @ts-ignore
      $('#edit').modal('hide');
      this.patientService.editProfile(form.value.email, form.value.dob, form.value.address)
      .subscribe(response => {
        console.log(response);
        this.loadProfile();
      });
    });
  }

  loadProfile() {
    this.patientService.viewProfile()
    .subscribe(
      response => {
        this.patient = (response as any).patient;
        this.address = this.patient.patient_address;
        this.email = this.patient.patient_email;
        this.dob = this.patient.patient_dob;
        this.loaded = true;
      },
      error => {
        console.log('error occured');
      }
    );
  }

  onEmailVerify() {
    this.patientService.sendEmailVerificationLink()
    .subscribe(response => console.log(response));
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
