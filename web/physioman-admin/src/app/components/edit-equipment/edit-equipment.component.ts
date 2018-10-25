import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-equipment',
  templateUrl: './edit-equipment.component.html',
  styleUrls: ['./edit-equipment.component.css']
})
export class EditEquipmentComponent implements OnInit {

  private product_id;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.product_id = JSON.parse(localStorage.getItem('product_id'));
    this.adminService.getEquipmentDetails(this.product_id)
    .subscribe(response => console.log(response));
  }

}
