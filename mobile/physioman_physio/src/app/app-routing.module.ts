import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full', runGuardsAndResolvers: 'always' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule', runGuardsAndResolvers: 'always' },
  { path: 'menu', loadChildren: './menu/menu.module#MenuPageModule', runGuardsAndResolvers: 'always'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor(private router: Router) {
    // this.initializeApp();
  }

  initializeApp() {
    this.router.navigate(['dashboard']);
  }
}
