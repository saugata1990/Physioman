import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Router } from '@angular/router';
import { HASORDERED } from '../../store/actions/actions';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  @Input() private purchased_items: [any];
  @Input() private rented_items: [any];
  private total_price = 0;
  private paymentMode;
  private orderSuccess = false;
  private onlinePaymentSuccess = false;
  @ViewChild('submit') submit: ElementRef;
  private loggedIn = false;
  private hasBooking = false;
  private hasOrdered = false;

  constructor(private patientService: PatientService, private router: Router) { }

  ngOnInit() {
    console.log('items to purchase ', this.purchased_items);
    console.log('items to rent ', this.rented_items);
    this.purchased_items.map(item => this.total_price += item.selling_price);
    this.rented_items.map(item => this.total_price += item.rent_price);
    console.log('Amount payable: ', this.total_price);
  }


  openModal() {
    $(document).ready(() => {
      // @ts-ignore
      $('#payment').modal('show');
    });
  }

  removeFromCart(index, type) {
    if(type === 'purchase') {
      this.purchased_items.splice(index, 1);
    } else {
      this.rented_items.splice(index, 1);
    }
  }

  onOrderPlaced() {
    this.patientService.placeOrder(this.purchased_items, this.rented_items, this.paymentMode)
    .subscribe(
      response => {
        this.orderSuccess = true;
        setTimeout(() => {
          $(document).ready(() => {
            // @ts-ignore
            $('#cart').click().modal('hide');
            this.patientService.updateState({action: HASORDERED});
            this.router.navigate(['/order-status']);
          });
        }, 3000);
      },
      error => console.log(error)
    );
  }

  onPaymentCompletion(event) {
    console.log('event fired and accepted ', event);
    this.onlinePaymentSuccess = event === 'success' ? true : false;
    if (this.onlinePaymentSuccess) {
      this.submit.nativeElement.click();
    }
  }

}
