import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit, AfterViewChecked {

  loaded_list: [any];
  count: number;
  // private ordered_items: [any];
  rented_items = new Array();
  purchased_items = new Array();
  total_price = 0;
  checkout = false;
  loggedIn = false;
  hasBooking = false;
  hasOrdered = false;
  itemsLoaded = false;

  constructor(private patientService: PatientService, private router: Router,
    private sanitizer: DomSanitizer, private toastr: ToastrManager) { }

  ngOnInit() {
    this.checkState();
    this.patientService.listEquipment()
    .subscribe(response => {
      this.itemsLoaded = true;
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
    console.log(this.count);
  }

  addToCart(item, mode) {
    if (this.checkout) {
      this.checkout = false;
    }
    if (!this.loggedIn) {
      this.toastr.warningToastr('Please log in to add items to cart');
    }
    // tslint:disable-next-line:one-line
    else {
      if (mode === 1) {
        this.rented_items.push(item);
      } else {
        this.purchased_items.push(item);
      }
      this.toastr.successToastr('Item added to cart');
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
      this.total_price = 0;
      this.purchased_items.map(item => this.total_price += item.selling_price);
      this.rented_items.map(item => this.total_price += item.rent_price);
      console.log('total price: ', this.total_price);
      $(document).ready(() => {
        // @ts-ignore
        $('#cart').modal();
      });
    } else {
      this.toastr.errorToastr('Cart is empty');
    }
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
  }


}
