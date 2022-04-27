import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from 'app/auth/SessionService';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private sessionService: SessionService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.log(err);
        if (err.status === 401 || err.status === 403) {
          // auto logout if 401 response returned from api
          this.sessionService.logout();
          location.reload(true);
        }

        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
