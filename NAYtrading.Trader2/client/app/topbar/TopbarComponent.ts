import { Component } from '@angular/core';
import { SessionService } from 'app/auth/SessionService';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-topbar',
  templateUrl: 'TopbarComponent.html',
  styleUrls: ['./TopbarComponent.scss']
})
export class TopbarComponent {
  title = environment.title;

  constructor(readonly sessionService: SessionService) {}

  logout() {
    this.sessionService.logout();
  }
}
