import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { Events } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  hasBooking = false;
  hasOrdered = false;

  constructor(private apiService: ApiService, public dataService: DataService,
     private storage: Storage, private router: Router) {
  }

  ngOnInit() {
    this.checkUserActivity(this.dataService.patientToken);
  }

  testFn() {
    //
  }

  checkUserActivity(token) {
    this.apiService.getUserActivity(token)
    .subscribe(activity => {
      this.dataService.hasBooking = (activity as any).hasBooking;
      this.dataService.hasOrdered = (activity as any).hasOrdered;
      // this.events.publish('user_activity',
      //    {hasBooking: this.dataService.hasBooking, hasOrdered: this.dataService.hasOrdered});
    });
  }




  onLogout() {
    this.dataService.clearState();
    this.storage.clear()
    .then(result => this.router.navigateByUrl(''));
  }


}
