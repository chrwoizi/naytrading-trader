import { Component } from '@angular/core';
import { SessionService } from 'app/auth/SessionService';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './LandingComponent.html',
  styleUrls: ['./LandingComponent.scss']
})
export class LandingComponent {
  naytrading = environment.naytrading;
  constructor(readonly sessionService: SessionService) {}
}
