import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../services/api.service';
import { ModalController } from '@ionic/angular';
import { ProcessAppointmentPage } from '../process-appointment/process-appointment.page';
import { Router } from '@angular/router';
import { ProcessBookingPage } from '../process-booking/process-booking.page';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  private loggedInAs;
  private requests = new Array();
  private bookings = new Array();
  private token;
  private otherAccount;
  private alternateAcct;

  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private modalController: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    this.storage.get('loggedInAs')
    .then(val => {
      this.loggedInAs = val;
      if (this.loggedInAs === 'physio') {
        this.alternateAcct =  'consultant';
      } else {
        this.alternateAcct =  'physio';
      }
      this.storage.get(this.loggedInAs)
      .then(token => {
        this.token = token;
        this.hasOtherAccount();
        if (this.loggedInAs === 'consultant') {
          this.getAppointments();
        } else {
          this.getBookings();
        }
      });
    });
  }

  reloadAppointments() {
    this.getAppointments();
  }

  getAppointments() {
    this.apiService.getPendingConsultations(this.token)
    .subscribe(consultations => {
      this.requests = (consultations as any).requests;
      this.requests.map(request => {
        this.apiService.getPatientAddress(request.requested_by_patient, this.token)
        .subscribe(details => {
          request.name = (details as any).patient_name;
          request.phone = (details as any).patient_phone;
          request.address = (details as any).patient_address;
        });
      });
    });
  }

  reloadBookings() {
    this.getBookings();
  }

  getBookings() {
    this.apiService.getAssignedBookings(this.token)
    .subscribe(response => {
      this.bookings = (response as any).bookings;
      console.log(this.bookings);
      this.bookings.map(booking => {
        this.apiService.getPatientAddress(booking.booked_for_patient, this.token)
        .subscribe(details => {
          booking.name = (details as any).patient_name;
          booking.phone = (details as any).patient_phone;
          booking.address = (details as any).patient_address;
        });
      });
    });
  }

  async processBooking(booking_id, session_status) {
    const modal = await this.modalController.create({
      component: ProcessBookingPage,
      componentProps: {booking_id, session_status, token: this.token}
    });
    await modal.present();
    await modal.onDidDismiss().then(() => this.reloadBookings());
  }

  async processAppointment(request_id, payment_mode) {
    const modal = await this.modalController.create({
      component: ProcessAppointmentPage,
      componentProps: {request_id, payment_mode, token: this.token}
    });
    await modal.present();
    await modal.onDidDismiss().then(() => this.reloadAppointments());
  }

  hasOtherAccount() {
    this.apiService.checkForOtherAccount(this.loggedInAs, this.token)
    .then(response => this.otherAccount = response);
  }


  logout(switchAcct = false) {
    if (this.loggedInAs === 'consultant') {
      this.storage.remove('consultant');
    } else {
      this.storage.remove('physio');
    }
    this.storage.remove('loggedInAs');
    if (!switchAcct) {
      this.storage.remove('username');
      this.storage.remove('password');
    }
    this.router.navigateByUrl('/login');
  }

}
