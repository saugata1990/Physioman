import { AdminService } from './../../services/admin.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-equipment',
  templateUrl: './list-equipment.component.html',
  styleUrls: ['./list-equipment.component.css']
})
export class ListEquipmentComponent implements OnInit {

  private products = new Array();

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.adminService.listEquipment()
    .subscribe(response => {
      this.products = (response as any).products;

    });
  }

  onEquipmentSelected(id) {
    localStorage.setItem('product_id', JSON.stringify(id));
    this.router.navigate(['edit-equipment']);
  }

  addItems(id) {
    console.log('works');
  }

}
