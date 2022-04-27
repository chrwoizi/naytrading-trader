import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AuthInterceptor } from './AuthInterceptor';
import { LoginModule } from './login/LoginModule';

@NgModule({
  declarations: [],
  imports: [CommonModule, LoginModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AuthModule {}
