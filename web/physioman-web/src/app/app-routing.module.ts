import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BookingComponent } from './components/booking/booking.component';
import { BookingStatusComponent } from './components/booking-status/booking-status.component';
import { ShoppingComponent } from './components/shopping/shopping.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { OrderStatusComponent } from './components/order-status/order-status.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'my-profile', component: ProfileComponent },
  { path: 'new-booking', component: BookingComponent },
  { path: 'booking-status', component: BookingStatusComponent },
  { path: 'order-status', component: OrderStatusComponent },
  { path: 'shop', component: ShoppingComponent },
  { path: 'booking-status', component: BookingStatusComponent },
  { path: 'contact-us', component: ContactUsComponent },
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
