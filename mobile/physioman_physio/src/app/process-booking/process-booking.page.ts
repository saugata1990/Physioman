import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ModalController, NavParams } from '@ionic/angular';

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

  constructor(private apiService: ApiService, private modalController: ModalController, private navParams: NavParams) { }

  ngOnInit() {
    this.booking_id = this.navParams.get('booking_id');
    this.session_status = this.navParams.get('session_status');
    this.token = this.navParams.get('token');
  }

  onSendOTP() {
    this.apiService.sendSessionOTP(this.token, this.booking_id)
    .subscribe(response => {
      this.session_id = (response as any).session._id;
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

  onEndSession() {
    //
  }

  close() {
    this.modalController.dismiss();
  }

}
