import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ModalController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-process-booking',
  templateUrl: './process-booking.page.html',
  styleUrls: ['./process-booking.page.scss'],
})
export class ProcessBookingPage implements OnInit {

  private booking_id;
  private session_status;
  private token;
  private session_otp;
  private session_id;
  amount_payable: number;
  amount_received: number;
  cash_received = false;

  constructor(private apiService: ApiService,
              private modalController: ModalController,
              private navParams: NavParams,
              private storage: Storage) { }

  ngOnInit() {
    this.booking_id = this.navParams.get('booking_id');
    this.session_status = this.navParams.get('session_status');
    this.token = this.navParams.get('token');
  }

  onSendOTP() {
    this.apiService.sendSessionOTP(this.token, this.booking_id)
    .subscribe(response => {
      this.session_id = (response as any).session._id;
      this.session_status = 'otp sent';
      this.storage.set('session_id', this.session_id);
      console.log('session has been created', response);
    },
       error => console.log(error));
  }

  onStartSession() {
    this.apiService.startSession(this.booking_id, this.session_otp, this.token)
    .subscribe(response => {
      this.session_status = 'started';
      console.log(response);
    });
  }

  async onEndSession() {
    if (!this.session_id) {
      this.session_id = await this.storage.get('session_id');
    }
    this.apiService.endSession(this.session_id, this.token)
    .subscribe(response => {
      console.log(response);
      this.session_status = 'ended';
      this.close();
    }, error => console.log(error));
  }

  receivePayment(patient_id) {
    this.apiService.getPayableAmount(patient_id, this.token)
    .subscribe(amt => {
      this.amount_payable = (amt as any).amount;
    });
  }


  close() {
    this.modalController.dismiss();
  }

}
