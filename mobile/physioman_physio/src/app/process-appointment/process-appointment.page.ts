import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ApiService } from '../services/api.service';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-process-appointment',
  templateUrl: './process-appointment.page.html',
  styleUrls: ['./process-appointment.page.scss'],
})
export class ProcessAppointmentPage implements OnInit {

  private request_id;
  private payment_mode;
  private token;
  private numSessions;
  private cpr;
  private bookingPaymentMode;
  private bookingPaymentReceived = false;
  private otp;

  constructor(private apiService: ApiService, private modalController: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.request_id = this.navParams.get('request_id');
    this.payment_mode = this.navParams.get('payment_mode');
    this.token = this.navParams.get('token');
  }

  setSessions() {
    this.apiService.assignSessions(this.request_id, this.otp, this.numSessions, this.bookingPaymentMode,
       this.bookingPaymentReceived, this.token).subscribe(response => console.log(response),
      error => console.log(error));
    this.close();
  }

  close() {
    this.modalController.dismiss();
  }

}
