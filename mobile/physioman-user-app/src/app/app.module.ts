import { ProfilePageModule } from './profile/profile.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
// import { Toast } from '@ionic-native/toast/ngx';
import { DataService } from './data.service';
import { AuthGuard, AuthGuardLogin } from './auth.guard';
import { PaymentPage } from './payment/payment.page';
import { PaymentPageModule } from './payment/payment.module';
import { CartPage } from './cart/cart.page';
import { CartPageModule } from './cart/cart.module';
import { NewBookingPage } from './new-booking/new-booking.page';
import { NewBookingPageModule } from './new-booking/new-booking.module';
import { ProfilePage } from './profile/profile.page';





@NgModule({
  declarations: [AppComponent],
  entryComponents: [CartPage, PaymentPage, NewBookingPage, ProfilePage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CartPageModule,
    PaymentPageModule,
    NewBookingPageModule,
    ProfilePageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ApiService,
    DataService,
    AuthGuard,
    AuthGuardLogin,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
