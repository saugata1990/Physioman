import { Router } from '@angular/router';
import { AdminService } from './../../services/admin.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-equipment-creation',
  templateUrl: './equipment-creation.component.html',
  styleUrls: ['./equipment-creation.component.css']
})
export class EquipmentCreationComponent implements OnInit {

  private image: File;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
  }

  onFileChanged(event) {
    this.image = event.target.files[0];
  }


  onCreateEquipment(frm) {
    const fd = new FormData();
    fd.append('image', this.image, this.image.name);
    fd.append('product_model', frm.value.model);
    fd.append('product_name', frm.value.name);
    fd.append('product_manufacturer', frm.value.manufacturer);
    fd.append('product_category', frm.value.category);
    fd.append('product_specifications', frm.value.specifications);
    fd.append('product_description', frm.value.description);
    fd.append('search_tags', frm.value.tags);
    fd.append('selling_price', frm.value.sprice);
    fd.append('rent_price', frm.value.rprice);
    fd.append('stock_for_sale', frm.value.sstock);
    fd.append('stock_for_rent', frm.value.rstock);

    this.adminService.addEquipment(fd)
    .subscribe(response => {
      console.log(response);
    }, error => console.log(error));
  }

}
