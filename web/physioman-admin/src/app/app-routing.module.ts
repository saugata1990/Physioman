import { EditEquipmentComponent } from './components/edit-equipment/edit-equipment.component';
import { EquipmentCreationComponent } from './components/equipment-creation/equipment-creation.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserCreationComponent } from './components/user-creation/user-creation.component';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { ListEquipmentComponent } from './components/list-equipment/list-equipment.component';

const routes: Routes = [
  { path: '', component: IncidentsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'incidents', redirectTo: '', pathMatch: 'full' },
  { path: 'list-equipment', component: ListEquipmentComponent },
  { path: 'create-equipment', component: EquipmentCreationComponent },
  { path: 'edit-equipment', component: EditEquipmentComponent },
  { path: 'manage-users',
    component: UserManagementComponent,
    children: [
      {path: '', redirectTo: 'users', pathMatch: 'full'},
      { path: 'create', component: UserCreationComponent },
      { path: 'users', component: UserListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
