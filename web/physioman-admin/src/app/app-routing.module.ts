import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IncidentsComponent } from './components/incidents/incidents.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserCreationComponent } from './components/user-creation/user-creation.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', component: IncidentsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'incidents', redirectTo: '', pathMatch: 'full' },
  { path: 'manage-users',
    component: UserManagementComponent,
    children: [
      { path: 'create', component: UserCreationComponent },
      { path: 'edit', component: IncidentsComponent } // just a placeholder
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
