import { Component } from '@angular/core';
import { SessionService } from 'app/auth/SessionService';

@Component({
  selector: 'app-topbar',
  templateUrl: 'TopbarComponent.html',
  styleUrls: ['./TopbarComponent.scss']
})
export class TopbarComponent {
  title = 'naytrading-trader';

  constructor(readonly sessionService: SessionService) {}

  logout() {
    this.sessionService.logout();
  }
}
