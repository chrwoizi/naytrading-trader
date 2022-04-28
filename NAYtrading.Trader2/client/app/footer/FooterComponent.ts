import { Component } from '@angular/core';
import { SessionService } from 'app/auth/SessionService';

@Component({
  selector: 'app-footer',
  templateUrl: 'FooterComponent.html',
  styleUrls: ['./FooterComponent.scss']
})
export class FooterComponent {
  constructor(readonly sessionService: SessionService) {}
}
