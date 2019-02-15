import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../services/api.service';
import { ModalController } from '@ionic/angular';
import { ProcessAppointmentPage } from '../process-appointment/process-appointment.page';
import { Router } from '@angular/router';
import { ProcessBookingPage } from '../process-booking/process-booking.page';
import { noComponentFactoryError } from '@angular/core/src/linker/component_factory_resolver';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  loggedInAs;
  requests = new Array();
  bookings = new Array();
  private token;
  // private otherAccount;
  // private alternateAcct;
  otherAccount;
  username;
  password;



  constructor(
    private apiService: ApiService,
    private storage: Storage,
    private modalController: ModalController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadAppState();
  }

  ionViewWillEnter() {
    console.log('dashboard view is entered');
    // this.loadAppState();
  }

  loadAppState() {
    this.storage.get('loggedInAs')
    .then(loggedInAs => {
      this.loggedInAs = loggedInAs;
      this.storage.get(this.loggedInAs)
      .then(token => {
        this.token = token;
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
      this.requests = (consultations as any).bookings;
      this.requests.map(request => {
        this.apiService.getPatientInfo(request.patient_id, this.token)
        .subscribe(details => {
          request.patient_id = (details as any).patient._id;
          request.name = (details as any).patient.patient_name;
          request.phone = (details as any).patient.patient_phone;
          request.address = (details as any).patient.patient_address;
          request.collect_cash = request.consultation_fee_paid ? 'PAID' : 'NOT PAID';
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
      console.log(response);
      this.bookings = (response as any).bookings;
      this.bookings.map(booking => {
        this.apiService.getPatientInfo(booking.patient_id, this.token)
        .subscribe(details => {
          booking.patient_id = (details as any).patient._id;
          booking.name = (details as any).patient.patient_name;
          booking.phone = (details as any).patient.patient_phone;
          booking.address = (details as any).patient.patient_address;
          if (booking.number_of_sessions_unlocked === booking.sessions_completed) {
            booking.payment_needed = true;
          } else {
            booking.payment_needed = false;
          }
        });
      });
    });
  }

  async processBooking(booking) {
    const modal = await this.modalController.create({
      component: ProcessBookingPage,
      componentProps: {booking, payment_needed: booking.payment_needed, token: this.token}
    });
    await modal.present();
    await modal.onDidDismiss().then(() => this.reloadBookings());
  }

  // request_id, patient_id, consultation_fee_paid
  async processAppointment(request) {
    const modal = await this.modalController.create({
      component: ProcessAppointmentPage,
      componentProps: {request, token: this.token}
    });
    await modal.present();
    await modal.onDidDismiss().then(() => this.reloadAppointments());
  }


}
