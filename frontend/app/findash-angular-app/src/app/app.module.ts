import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { SigninComponent } from './signin/signin.component';
import { DashboardsListComponent } from './dashboards-list/dashboards-list.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LinechartComponent } from './linechart/linechart.component';
import { AvgcalcComponent } from './avgcalc/avgcalc.component';
import { LoadDashboardComponent } from './dashboards-list/load-dashboard/load-dashboard.component';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { MessagesService } from './messages/messages.service';
import { DataInterceptorService } from './data/data-interceptor.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SigninComponent,
    DashboardsListComponent,
    DashboardComponent,
    LinechartComponent,
    AvgcalcComponent,
    LoadDashboardComponent,
    MessagesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    MessagesService, /*multi instance are possible, add local provider where suitable*/
    {provide: HTTP_INTERCEPTORS, useClass: DataInterceptorService, multi:true }, /* add http intercept for data requests */
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
