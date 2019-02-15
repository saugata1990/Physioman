import { Component, OnInit, Input, EventEmitter, Output, ElementRef, AfterViewInit } from '@angular/core';
import { MERCHANT_KEY } from '../../keys';
import { v4 as uuid} from 'uuid';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewInit {

  @Input() amount;
  @Output() successMessage = new EventEmitter();
  patient = new Patient(); // remove model dependency

  constructor(private patientService: PatientService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.patientService.viewProfile()
    .subscribe(
      response => {
       this.patient.populate(response);
      },
      error => console.log(error)
    );
  }


  private loadExternalScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.setAttribute('id', 'bolt');
      scriptElement.setAttribute('bolt-color', 'e34524');
      scriptElement.setAttribute('bolt-logo', 'http://boltiswatching.com/wp-content/uploads/2015/09/Bolt-Logo-e14421724859591.png');
      scriptElement.onload = resolve;
      document.getElementsByTagName('head')[0].appendChild(scriptElement);
    });
  }

  ngAfterViewInit() {
    this.loadExternalScript('https://sboxcheckout-static.citruspay.com/bolt/run/bolt.min.js')
    .then(() => {
      console.log('script loaded');
    });
  }


  onPayment(form) {
    $(document).ready(() => {
      // @ts-ignore
      $('#payment').modal('hide');
    });
    const pd = {
      key: MERCHANT_KEY,
      amount: this.amount,
      txnid: uuid(),
      productinfo: 'some product', // this will come from the calling component
      firstname: this.patient.name.split(' ')[0],
      email: this.patient.email,
      phone: this.patient.phone,
      hash: null,
      surl: 'localhost:3000/api/services/payments/success',
      furl: 'localhost:3000/api/services/payments/failure'
    };

    const data = {
      'email': pd.email,
      'amount': pd.amount,
      'txnid': pd.txnid,
      'productinfo': pd.productinfo,
      'firstname': pd.firstname
    };

    this.patientService.getPayUMoneyHash(data.amount, data.txnid, data.productinfo, data.firstname, data.email).toPromise()
    .then(
      response => {
        const hash = (response as any).hash;
        pd.hash = hash;
      },
      error => {
        console.log(error);
      }
    )
    .then(() => {
      // @ts-ignore
      this.patientService.redirectToPayU(pd, bolt)
      .then(success => {
        if (success) {
          console.log('will fire success event now');
          this.successMessage.emit('success');
        }
      });
    });



  }

}
