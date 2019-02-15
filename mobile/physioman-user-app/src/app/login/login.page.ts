import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
// import { Toast } from '@ionic-native/toast/ngx';
import { DataService } from '../data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  phone;
  password;

  constructor(
    private apiService: ApiService, private dataService: DataService,
      private router: Router, private storage: Storage) { }

  ngOnInit() {
  }

  onLogin() {
    this.apiService.login(this.phone, this.password)
    .subscribe(token => {
      this.dataService.patientToken = token;
      this.storage.set('patientToken', this.dataService.patientToken)
      .then(result => {
        this.router.navigateByUrl('tabs');
      });
    }, error => {
      // this.toast.show('Invalid credentials', '3000', 'center')
      // .subscribe(toast => console.log(toast));
    });
  }

}
