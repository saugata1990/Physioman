import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.css']
})
export class UserCreationComponent implements OnInit, AfterViewChecked {

  private userType = 'physio';
  private isConsultant = false;
  private physio_email;
  private physio_id;
  private consultant_email;
  private consultant_id;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      if (this.physio_email) {
        this.physio_id = this.physio_email.split('@')[0];
      }
      if (this.consultant_email) {
        this.consultant_id = this.consultant_email.split('@')[0];
      }
    }, 0);
  }

  onPhysioCreated(frm) {
    this.adminService.createPhysio(frm.value.physio_id, frm.value.password, frm.value.physio_name, frm.value.physio_email,
    frm.value.physio_phone, frm.value.physio_gender, frm.value.physio_dob, frm.value.date_joined, frm.value.isConsultant)
    .subscribe(response => console.log(response), error => console.log(error));
  }

  onConsultantCreated(frm) {
    this.adminService.createConsultant(frm.value.consultant_id, frm.value.password, frm.value.consultant_name,
    frm.value.consultant_email, frm.value.consultant_phone, frm.value.consultant_gender, frm.value.date_joined)
    .subscribe(response => console.log(response), error => console.log(error));
  }

}
