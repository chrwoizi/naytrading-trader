import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { AuthServiceClient, ProfileServiceClient } from '../api';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _changeSubject = new Subject<boolean>();
  change$ = this._changeSubject.asObservable();

  constructor(
    private authServiceClient: AuthServiceClient,
    private profileServiceClient: ProfileServiceClient,
    private router: Router
  ) {}

  checkSession() {
    this.profileServiceClient
      .getProfile()
      .pipe(
        catchError(error => {
          if (error?.status === 403) {
            this.logout();
          }
          throw error;
        })
      )
      .subscribe(() => {});
  }

  login(username: string, password: string) {
    return this.authServiceClient.login({ username, password }).pipe(
      tap(res => this.setSession(res)),

      shareReplay()
    );
  }

  parseJwt(token) {
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    }

    return undefined;
  }

  private setSession(authResult: any) {
    const tokenData = this.parseJwt(authResult.idToken);

    if (tokenData) {
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', tokenData.exp);
      this._changeSubject.next(this.isLoggedIn());
    }
  }

  logout() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    if (!this.router.url.startsWith('/activate')) {
      this.router.navigate(['/']);
    }
    this._changeSubject.next(false);
  }

  public isLoggedIn() {
    return moment.utc().isBefore(this.getExpiration());
  }

  public isAdmin() {
    return this.isLoggedIn() && this.getTokenData()?.isAdmin;
  }

  public getTokenData() {
    const idToken = localStorage.getItem('id_token');
    if (!idToken) return undefined;
    return this.parseJwt(idToken);
  }

  public getUsername() {
    return this.getTokenData()?.username;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment.unix(expiresAt);
  }
}
