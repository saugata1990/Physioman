import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Storage } from '@ionic/storage';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private apiService: ApiService, private storage: Storage, private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get('patientToken')
      .then(token => {
        if (token) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLogin implements CanActivate {

  constructor(private apiService: ApiService, private dataService: DataService,
     private storage: Storage, private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get('patientToken')
      .then(token => {
        if (token) {
          this.dataService.patientToken = token;
          this.router.navigateByUrl('tabs');
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
