import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, AuthGuardLogin } from './auth.guard';

const routes: Routes = [
  { path: 'tabs', loadChildren: './tabs/tabs.module#TabsPageModule', canActivate: [AuthGuard] },
  { path: '', loadChildren: './login/login.module#LoginPageModule', canActivate: [AuthGuardLogin] },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  // { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  // { path: 'new-booking', loadChildren: './new-booking/new-booking.module#NewBookingPageModule' },
  // { path: 'cart', loadChildren: './cart/cart.module#CartPageModule' },
  // { path: 'payment', loadChildren: './payment/payment.module#PaymentPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
