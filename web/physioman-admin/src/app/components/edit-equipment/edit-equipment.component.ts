import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-equipment',
  templateUrl: './edit-equipment.component.html',
  styleUrls: ['./edit-equipment.component.css']
})
export class EditEquipmentComponent implements OnInit {

  private product_id;
  private product;
  private image = null;
  private dataLoaded = false;

  constructor(private adminService: AdminService, private router: Router, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.product_id = JSON.parse(localStorage.getItem('product_id'));
    this.adminService.getEquipmentDetails(this.product_id)
    .subscribe(response => {
      this.product = (response as any).product;
      this.product.imagePath = this.sanitizeUrl(this.product.product_image.data);
      this.dataLoaded = true;
      console.log(this.product);
    });
  }

  onFileChanged(event) {
    this.image = event.target.files[0];
  }

  onEditProduct(frm) {
    const fd = new FormData();
    if (this.image) {
      fd.append('image', this.image, this.image.name);
    }

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

    this.adminService.editEquipment(fd, this.product_id)
    .subscribe(response => console.log(response), error => console.log(error));
  }

  // add popup for confirmation
  onRemove(id) {
    return this.adminService.removeEquipment(id)
    .subscribe(response => console.log(response), error => console.log(error));
  }


  sanitizeUrl(url) {
    return this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
  }

}
