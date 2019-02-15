import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { AdminService } from './services/admin.service';
import * as $ from 'jquery';
import { HttpClientModule } from '@angular/common/http';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserCreationComponent } from './components/user-creation/user-creation.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { EquipmentCreationComponent } from './components/equipment-creation/equipment-creation.component';
import { ListEquipmentComponent } from './components/list-equipment/list-equipment.component';
import { EditEquipmentComponent } from './components/edit-equipment/edit-equipment.component';
import { ToastrModule } from 'ng6-toastr-notifications';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    IncidentsComponent,
    UserManagementComponent,
    UserCreationComponent,
    UserListComponent,
    EquipmentCreationComponent,
    ListEquipmentComponent,
    EditEquipmentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),

  ],
  providers: [AdminService],
  bootstrap: [AppComponent]
})
export class AppModule { }
