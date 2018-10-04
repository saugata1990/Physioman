import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  private physios = new Array();
  private consultants = new Array();

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.getPhysios()
    .subscribe(response => this.physios = (response as any).physios);
    this.adminService.getConsultants()
    .subscribe(response => this.consultants = (response as any).consultants);
  }

  onView(userType, id) {
    console.log(this.physios);
  }
}
