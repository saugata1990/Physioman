import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';


@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.css']
})
export class OrderStatusComponent implements OnInit {
  orders = new Array();
  loaded = false;

  constructor(private patientService: PatientService, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.patientService.getOrderStatus()
    .subscribe(response => {
      this.orders = (response as any).orders;
      this.orders.map(
        order => {
          order.items_in_detail = new Array();
          order.ordered_items.map(item => {
            this.patientService.getEquipmentDetails(item)
            .subscribe(details => {
              const product = (details as any).product;
              product.imagePath = this.sanitizeUrl(product.product_image.data);
              if (order.items_purchased.includes(item)) {
                product.order_mode = 'purchase';
              } else {
                product.order_mode = 'rent';
              }
              order.items_in_detail.push(product);
              this.loaded = true;
              console.log(this.orders);
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
