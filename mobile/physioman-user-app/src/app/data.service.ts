import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  hasBooking = false;
  hasOrdered = false;
  patientToken;
  patient: any;
  // consultation_fee;
  // session_fee;
  orders = new Array();
  products = new Array();
  bookings = new Array();

  constructor(private apiService: ApiService, private sanitizer: DomSanitizer) { }

  clearState() {
    this.patientToken = null;
  }

  loadEquipmentList(arg: any) {
    this.products = arg.products;
    this.products.map(item => item.imagePath = this.sanitizeUrl(item.product_image.data));
  }

  loadOrders() {
    this.hasOrdered = true;
    this.apiService.getOrderStatus(this.patientToken)
    .subscribe((response: any) => {
      this.orders = response.orders;
      this.orders.map(
        order => {
          order.items_in_detail = new Array();
          order.ordered_items.map(item => {
            this.apiService.getEquipmentDetails(item, this.patientToken)
            .subscribe(details => {
              const product = (details as any).product;
              product.imagePath = this.sanitizeUrl(product.product_image.data);
              if (order.items_purchased.includes(item)) {
                product.order_mode = 'purchase';
              } else {
                product.order_mode = 'rent';
              }
              order.items_in_detail.push(product);
            });
          });
        }
      );
    });
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
  }

}
