import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ApiService } from './services/api.service';
import { ProcessAppointmentPage } from './process-appointment/process-appointment.page';
import { ProcessAppointmentPageModule } from './process-appointment/process-appointment.module';
import { ProcessBookingPageModule } from './process-booking/process-booking.module';
import { MenuPageModule } from './menu/menu.module';
import { ProcessBookingPage } from './process-booking/process-booking.page';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [ProcessAppointmentPage, ProcessBookingPage],
  imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, HttpClientModule,
            ProcessAppointmentPageModule, ProcessBookingPageModule, MenuPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    ApiService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
