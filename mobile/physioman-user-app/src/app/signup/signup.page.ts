import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  phone;
  password;
  confirm_password;
  name;
  gender = 'male';

  constructor(private apiService: ApiService, private dataService: DataService,
     private router: Router, private alertController: AlertController) { }

  ngOnInit() {
  }

  onFormSubmitted() {
    this.apiService.sendOTP(this.phone, this.dataService.patientToken)
    .subscribe(async response => {
      const alert = await this.alertController.create({
        header: 'Verify OTP',
        backdropDismiss: false,
        inputs: [
          {
            name: 'otp',
            type: 'text',
            placeholder: 'Enter OTP'
          }
        ],
        buttons: [
          {
            text: 'Submit',
            handler: (data) => {
              this.apiService.verifyOTP(this.phone, data.otp, this.dataService.patientToken)
              .subscribe(response2 => {
                alert.dismiss()
                .then(() => {
                  this.signup();
                });
              }, error => {
                console.log(error);
              });
              return false;
            }
          }
        ]
      });
      await alert.present();
      // await alert.onDidDismiss()
      // .then(() => {
      //    console.log('closed');
      // });
    });
  }

  signup() {
    this.apiService.signup(this.phone, this.password, this.name, this.gender)
    .subscribe(response => {
      console.log('Signed up successfully');
      this.router.navigateByUrl('');
    }, error => {
      //
    });
  }

}
