import { DataService } from './../data.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {


  constructor(private apiService: ApiService, public dataService: DataService,
     private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.dataService.loadOrders();
  }

  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
  }

}
