import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit, AfterViewChecked {

  private loaded_list: [any];
  private count: number;
  // private ordered_items: [any];
  private rented_items = new Array();
  private purchased_items = new Array();
  private checkout = false;
  private loggedIn = false;
  private hasBooking = false;
  private hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.checkState();
    this.patientService.listEquipment()
    .subscribe(response => {
      this.onLoadEquipmentList(response);
    },
    error => console.log(error));
  }

  ngAfterViewChecked() {
    this.checkState();
  }


  checkState() {
    this.patientService.getState()
    .subscribe(state => {
      this.loggedIn = state.loggedIn;
      this.hasBooking = state.hasBooking;
      this.hasOrdered = state.hasOrdered;
    });
  }

  onSearch(form) {
    this.patientService.searchEquipment(form.value.search)
    .subscribe(response => {
      this.onLoadEquipmentList(response);
    },
    error => console.log(error));
  }

  onLoadEquipmentList(response) {
    this.loaded_list = (response as any).products;
    this.loaded_list.map(item => item.imagePath = this.sanitizeUrl(item.product_image.data));
    this.count = (response as any).count;
  }

  addToCart(item, mode) {
    if (!this.loggedIn) {
      alert('Please log in to add items to cart');
    }
    // tslint:disable-next-line:one-line
    else {
      if (mode === 1) {
        this.rented_items.push(item);
      } else {
        this.purchased_items.push(item);
      }
      alert('Item added to cart');
    }
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

  viewCart() {
    if (this.rented_items.length || this.purchased_items.length) {
      this.checkout = true;
      $(document).ready(() => {
        // @ts-ignore
        $('#cart').modal();
      });
    } else {
      alert('Cart is empty');
    }
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
  }


}
