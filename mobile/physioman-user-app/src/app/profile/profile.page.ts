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

}
