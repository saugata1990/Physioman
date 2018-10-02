import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private userType;
  private username;
  private password;
  private invalid_creds = false;

  constructor(private apiService: ApiService, private storage: Storage, private router: Router) { }

  ngOnInit() {
    this.storage.get('loggedInAs')
    .then(val => {
      if (val) {
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  onLogin() {
    this.storage.set('username', this.username);
    this.storage.set('password', this.password);
    this.apiService.login(this.username, this.password, this.userType)
    .subscribe(response => {
      this.storage.set(this.userType, response);
      this.storage.set('loggedInAs', this.userType);
      this.router.navigateByUrl('/dashboard');
    },
    error => this.invalid_creds = true);
  }

}
