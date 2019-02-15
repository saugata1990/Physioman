import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { CartPage } from '../cart/cart.page';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage implements OnInit {

  count: number;
  rented_items = new Array();
  purchased_items = new Array();
  search_item;
  total_price = 0;
  loaded = false;

  constructor(private apiService: ApiService, public dataService: DataService,
     private router: Router, private sanitizer: DomSanitizer, private modalController: ModalController) { }

  ngOnInit() {
    this.apiService.listEquipment(this.dataService.patientToken)
    .subscribe((response: any) => {
      this.loaded = true;
      this.count = response.count;
      this.dataService.loadEquipmentList(response);
    }, error => console.log(error));
  }



  onSearch() {
    this.loaded = false;
    this.apiService.searchEquipment(this.search_item, this.dataService.patientToken)
    .subscribe((response: any) => {
      this.dataService.loadEquipmentList(response);
      this.count = response.count;
      this.loaded = true;
    },
    error => console.log(error));
  }


  addToCart(item, mode) {
    if (mode === 1) {
      this.rented_items.push(item);
    } else if (mode === 0) {
      this.purchased_items.push(item);
    }
  }


  emptyCart() {
    this.rented_items = new Array();
    this.purchased_items = new Array();
  }

  getCartCount() {
    let count = 0;
    if (this.rented_items.length) {
      count += this.rented_items.length;
    }
    if (this.purchased_items.length) {
      count += this.purchased_items.length;
    }
    return count;
  }

  async viewCart() {
    if (this.rented_items.length || this.purchased_items.length) {
      this.total_price = 0;
      this.purchased_items.map(item => this.total_price += item.selling_price);
      this.rented_items.map(item => this.total_price += item.rent_price);
      const modal = await this.modalController.create({
        component: CartPage,
        componentProps: { purchased_items: this.purchased_items, rented_items: this.rented_items,
           total_price: this.total_price },
        backdropDismiss: false
      });
      await modal.present();
      modal.onDidDismiss().then(data => {
        if (data.data.message === 'placing order') {
          this.emptyCart();
        }
      });
    }
  }


}
