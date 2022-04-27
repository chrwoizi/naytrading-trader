import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthGuard } from './AuthGuard';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard extends AuthGuard {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.sessionService.isLoggedIn()) {
      if (this.sessionService.isAdmin()) {
        return true;
      } else {
        return this.router.parseUrl('/');
      }
    } else {
      return this.router.parseUrl('/login');
    }
  }
}
