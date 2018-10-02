import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    $(document).ready(() => {
      // @ts-ignore
      $('#login').modal('show');
    });
  }

  onLogin(frm) {
    this.adminService.login(frm.value.admin_id, frm.value.password)
    .subscribe(
      response => {
        localStorage.setItem('adminToken', JSON.stringify(response));
        $(document).ready(() => {
          // @ts-ignore
          $('#login').modal('hide');
          this.router.navigate(['/']);
        });
      },
      error => console.log(error)
    );
  }

}
