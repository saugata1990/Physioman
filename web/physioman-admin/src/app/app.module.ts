import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    IncidentsComponent,
    UserManagementComponent,
    UserCreationComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [AdminService],
  bootstrap: [AppComponent]
})
export class AppModule { }
