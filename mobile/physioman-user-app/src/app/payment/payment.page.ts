import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { v4 as uuid} from 'uuid';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit, AfterViewInit {

  @Input() amount;

  constructor(private apiService: ApiService, public dataService: DataService,
     private modalController: ModalController) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.loadExternalScript('https://sboxcheckout-static.citruspay.com/bolt/run/bolt.min.js')
    .then(() => {
      console.log('script loaded');
    });
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

  onPayment(form) {
    const pd = {
      key: 'EE9qCihR',
      amount: this.amount,
      txnid: uuid(),
      productinfo: 'some product', // this will come from the form
      firstname: this.dataService.patient.patient_name.split(' ')[0],
      email: this.dataService.patient.patient_email,
      phone: this.dataService.patient.patient_phone,
      hash: null,
      surl: this.apiService.baseUrl + 'api/services/payments/success',
      furl: this.apiService.baseUrl + 'api/services/payments/failure'
    };

    const data = {
      'email': pd.email,
      'amount': pd.amount,
      'txnid': pd.txnid,
      'productinfo': pd.productinfo,
      'firstname': pd.firstname
    };

    this.apiService.getPayUMoneyHash(data.amount, data.txnid, data.productinfo,
       data.firstname, data.email, this.dataService.patientToken).toPromise()
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
      this.apiService.redirectToPayU(pd, bolt)
      .then(success => {
        if (success) {
          this.modalController.dismiss({
            message: 'success'
          });
        }
      }, failure => {
        this.modalController.dismiss({
          message: 'failure'
        });
      });
    });
  }

  cancelTxn() {
    this.modalController.dismiss({message: 'cancelled'});
  }

}
