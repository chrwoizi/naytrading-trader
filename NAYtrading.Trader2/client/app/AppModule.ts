import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BASE_PATH } from './api';
import { AppComponent } from './AppComponent';
import { AppRoutingModule } from './AppRoutingModule';
import { AuthModule } from './auth/AuthModule';
import { SpinnerModule } from './components/spinner/SpinnerModule';
import { DemoMaterialModule } from './DemoMaterialModule';
import { ErrorInterceptor } from './helpers/ErrorInterceptor';
import { JwtInterceptor } from './helpers/JwtInterceptor';
import { LandingComponent } from './landing/LandingComponent';
import { MainComponent } from './main/MainComponent';
import { TopbarComponent } from './topbar/TopbarComponent';

@NgModule({
  declarations: [
    AppComponent,
    TopbarComponent,
    MainComponent,
    LandingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    AuthModule,
    RouterModule,
    SpinnerModule
  ],
  providers: [
    { provide: BASE_PATH, useValue: '/api' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
