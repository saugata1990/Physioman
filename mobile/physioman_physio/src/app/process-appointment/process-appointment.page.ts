import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { extractDirectiveDef } from '@angular/core/src/render3/definition';
import { request } from 'https';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-process-appointment',
  templateUrl: './process-appointment.page.html',
  styleUrls: ['./process-appointment.page.scss'],
})
export class ProcessAppointmentPage implements OnInit {

  request;
  // request_id;
  // patient_id;
  // consultation_fee_paid;
  // consultation_fee = 100;  // hardcoding to be removed
  // session_fee = 300;       // hardcoding to be removed
  token;
  numSessions;
  numSessionsPaid = 0;
  cpr;
  otp;


  constructor(private apiService: ApiService, private modalController: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.request = this.navParams.get('request');
    // this.request_id = this.navParams.get('request_id');
    // this.patient_id = this.navParams.get('patient_id');
    // this.consultation_fee_paid = this.navParams.get('consultation_fee_paid');
    this.token = this.navParams.get('token');
  }

  setSessions() {
    const amountPaid = this.getPayableAmount();
    console.log('request object', this.request);
    this.apiService.assignSessions(this.request._id, this.otp, this.numSessions, this.numSessionsPaid, amountPaid, this.token)
    .subscribe(response => {
      console.log(response);
      this.apiService.booking_cash_payment(this.request._id, this.token)
      .subscribe(response2 => {
        console.log(response2);
      });
    }, error => console.log(error));
    this.close();
  }

  getPayableAmount() {
    let extra = 0;
    if (!this.request.consultation_fee_paid) {
      extra = this.request.consultation_fee;
    }
    return (this.numSessionsPaid || 0) * this.request.session_fee + extra;
  }

  close() {
    this.modalController.dismiss();
  }



}
