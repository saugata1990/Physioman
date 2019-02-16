import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  @Input() editable;

  constructor(private apiService: ApiService, public dataService: DataService,
     private modalController: ModalController) { }

  ngOnInit() {
  }

  onEdit() {
    this.apiService.editProfile(
      this.dataService.patient.patient_email,
      this.dataService.patient.patient_dob,
      this.dataService.patient.patient_address,
      this.dataService.patientToken
    )
    .subscribe(response => {
      console.log(response);
      this.editable = false;
    });
  }

}
