import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SessionService } from '../SessionService';

@Component({
  selector: 'app-login',
  templateUrl: './LoginComponent.html',
  styleUrls: ['./LoginComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  inputType = 'password';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    readonly sessionService: SessionService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onEnterKey(event) {
    if (event.keyCode === 13 && this.form.valid) {
      this.send();
    }
  }

  send() {
    this.sessionService
      .login(this.form.get('email').value, this.form.get('password').value)
      .pipe(
        catchError(error => {
          return of({
            error: 'An error occurred'
          });
        })
      )
      .subscribe((x: any) => {
        if (!x.error) {
          this.router.navigate(['/main']);
          return;
        }

        this.snackbar.open(x.error, 'OK', {
          duration: 10000
        });
      });
  }
}
