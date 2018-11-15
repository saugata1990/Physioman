import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  private loggedInAs;
  private otherAccount;
  private alternateAcct;
  private username;
  private password;

  constructor(private apiService: ApiService, private storage: Storage, private router: Router) { }

  ngOnInit() {
    this.storage.get('loggedInAs')
    .then(val => {
      this.loggedInAs = val;
      this.hasOtherAccount(this.loggedInAs);
      if (this.loggedInAs === 'physio') {
        this.alternateAcct =  'consultant';
      } else {
        this.alternateAcct =  'physio';
      }
      this.getUserNameAndPassword();
    });
  }

  hasOtherAccount(tokenKey) {
    this.storage.get(tokenKey)
    .then(token => {
      this.apiService.checkForOtherAccount(this.loggedInAs, token)
      .then(response => this.otherAccount = response);
    });
  }

  getUserNameAndPassword() {
    return Promise.all([
      this.storage.get('username'),
      this.storage.get('password')
    ])
    .then(([username, password]) => {
      this.username = username;
      this.password = password;
    });
  }

  logout(switchAcct = false) {
    this.router.navigateByUrl('/login');
    if (this.loggedInAs === 'consultant') {
      this.storage.remove('consultant');
    } else {
      this.storage.remove('physio');
    }
    this.storage.remove('loggedInAs');
    if (!switchAcct) {
      this.storage.remove('username');
      this.storage.remove('password');
    } else if (switchAcct) {
      console.log('switching to ', this.alternateAcct);
      this.apiService.login(this.username, this.password, this.alternateAcct)
      .subscribe(response => {
        this.storage.set(this.alternateAcct, response);
        this.storage.set('loggedInAs', this.alternateAcct);
        this.router.navigateByUrl('/menu');
      });
    }
  }

}
