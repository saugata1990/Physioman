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
  private new_items_for_sale;
  private new_items_for_rent;
  private selected_item;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.loadEquipmentList();
  }

  loadEquipmentList() {
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
    $(document).ready(() => {
      this.selected_item = id;
      // @ts-ignore
      $('#add_items').modal('show');
    });
  }

  onAddItems(new_sale_items, new_rent_items) {
    $(document).ready(() => {
      this.adminService.updateInventory(this.selected_item, new_sale_items, new_rent_items)
      .subscribe(response => {
        console.log(response);
        this.new_items_for_rent = this.new_items_for_sale = 0;
        this.loadEquipmentList();
      },
      error => console.log(error));
      // @ts-ignore
      $('#add_items').modal('hide');
    });
  }

}
