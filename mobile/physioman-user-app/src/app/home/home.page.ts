import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { ModalController } from '@ionic/angular';
import { NewBookingPage } from '../new-booking/new-booking.page';
import { ProfilePage } from '../profile/profile.page';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  first_name;
  address;
  // hasBooking = false;
  // hasOrdered = false;
  loaded = false;
  constructor(private apiService: ApiService, public dataService: DataService, private modalController: ModalController,
     private router: Router, private storage: Storage) { }

  ngOnInit() {
    this.apiService.getProfileInfo(this.dataService.patientToken)
    .subscribe(
      info => {
        this.dataService.patient = (info as any).patient;
        this.first_name = this.dataService.patient.patient_name.split(' ')[0];
        this.address = this.dataService.patient.patient_address;
        this.loaded = true;
    });
  }

  async onBookAppointment() {
    const modal = await this.modalController.create({
      component: NewBookingPage,
      backdropDismiss: false
    });
    await modal.present();
  }

  async onEditProfile() {
    const modal = await this.modalController.create({
      component: ProfilePage,
      componentProps: {editable: true},
      backdropDismiss: false
    });
    await modal.present();
  }


}
