import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../services/api.service';
import { ModalController } from '@ionic/angular';
import { ProcessAppointmentPage } from '../process-appointment/process-appointment.page';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  private loggedInAs;
  private requests = new Array();
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
    if (this.loggedInAs === 'physio') {
      this.alternateAcct =  'consultant';
    } else {
      this.alternateAcct =  'physio';
    }
    this.storage.get('loggedInAs')
    .then(val => {
      this.loggedInAs = val;
      this.storage.get(this.loggedInAs)
      .then(token => {
        this.token = token;
        this.hasOtherAccount();
        if (this.loggedInAs === 'consultant') {
          this.getAppointments();
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
