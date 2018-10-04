import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {



  constructor(private adminService: AdminService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {

  }

  onCreateUser() {
    this.router.navigate(['create'], {relativeTo: this.route});
  }

  onEditUser() {
    this.router.navigate(['edit'], {relativeTo: this.route});
  }

  // onViewUsers() {
  //   console.log(this.physios);
  // }

}
