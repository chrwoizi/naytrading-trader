import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from './SessionService';

@Injectable({
  providedIn: 'root'
})
export class RedirectDashboardGuard implements CanActivate {
  constructor(private sessionService: SessionService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.sessionService.isLoggedIn()) {
      return this.router.parseUrl('/main');
    } else {
      return this.router.parseUrl('/');
    }
  }
}
