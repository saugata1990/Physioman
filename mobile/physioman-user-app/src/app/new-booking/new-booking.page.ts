import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { ModalController } from '@ionic/angular';
import { PaymentPage } from '../payment/payment.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-booking',
  templateUrl: './new-booking.page.html',
  styleUrls: ['./new-booking.page.scss'],
})
export class NewBookingPage implements OnInit {

  ailment_description;
  gender_preference = 'male';
  payment_mode = 'cash';
  consultation_fee = 100; // call api to get price

  constructor(private apiService: ApiService, public dataService: DataService, private router: Router,
     private modalController: ModalController) { }

  ngOnInit() {
  }

  onRequestSubmitted() {
    this.modalController.dismiss({message: 'submitting request'})
    .then(() => {
      if (this.payment_mode === 'card') {
        this.cardPayment();
      } else {
        this.placeRequest();
      }
    });
  }

  async cardPayment() {
    const modal = await this.modalController.create({
      component: PaymentPage,
      componentProps: {amount: this.consultation_fee}
    });
    await modal.present();
    modal.onDidDismiss().then(data => {
      if (data.data.message === 'success') {
        this.placeRequest();
      }
    });
  }

  placeRequest() {
    this.apiService.requestBooking(this.ailment_description, this.gender_preference,
       this.payment_mode, this.dataService.patientToken)
    .subscribe((response: any) => {
      if (this.payment_mode === 'wallet') {
        this.dataService.patient.wallet_amount -= this.consultation_fee;
        this.apiService.payWithWallet(this.consultation_fee, this.dataService.patientToken)
        .subscribe(response2 => console.log(response2));
      }
      this.dataService.hasBooking = true;
      this.dataService.bookings.push(response.booking);
      this.router.navigateByUrl('/tabs/bookings');
    });
  }

  goBack() {
    this.modalController.dismiss({message: 'cancelled'});
  }

}
