import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { ModalController } from '@ionic/angular';
import { PaymentPage } from '../payment/payment.page';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss']
})
export class CartPage implements OnInit {

  @Input() purchased_items;
  @Input() rented_items;
  @Input() total_price: number;
  payment_mode = 'cash';

  constructor(private apiService: ApiService, private dataService: DataService, private router: Router,
     private modalController: ModalController) { }

  ngOnInit() {
  }

  removeFromCart(item, mode) {
    if (mode === 'purchase') {
      const index = this.purchased_items.indexOf(item);
      this.total_price -= this.purchased_items[index].selling_price;
      this.purchased_items.splice(index, 1);
    } else {
      const index = this.rented_items.indexOf(item);
      this.total_price -= this.rented_items[index].rent_price;
      this.rented_items.splice(index, 1);
    }
    // TODO: show toast message
    if (this.total_price === 0) {
      this.modalController.dismiss({message: 'cart is empty'});
    }
  }

  emptyCart() {
    this.rented_items = this.purchased_items = new Array();
    this.total_price = 0;
  }


  onOrderPlaced() {
    this.modalController.dismiss({message: 'placing order'})
    .then(() => {
      if (this.payment_mode === 'card') {
        this.cardPayment();
      } else {
        this.placeOrder();
      }
    });
  }

  placeOrder() {
    this.apiService.placeOrder(this.purchased_items, this.rented_items, this.payment_mode, this.dataService.patientToken)
    .subscribe((response: any) => {
      if (this.payment_mode === 'wallet') {
        this.dataService.patient.wallet_amount -= this.total_price;
        this.apiService.payWithWallet(this.total_price, this.dataService.patientToken)
        .subscribe(response2 => console.log(response2));
      }
      this.dataService.orders.push(response.order);
      this.dataService.loadOrders();
      this.router.navigateByUrl('/tabs/orders');
    });
  }

  async cardPayment() {
    const modal = await this.modalController.create({
      component: PaymentPage,
      componentProps: {amount: this.total_price},
      backdropDismiss: false
    });
    await modal.present();
    modal.onDidDismiss().then(data => {
      if (data.data.message === 'success') {
        this.placeOrder();
      }
    });
  }
}
