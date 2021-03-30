import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  validations_form: FormGroup;
  errorMessage: string = '';
  loginSpinner: boolean = false;

  constructor(private ngZone: NgZone, private router: Router, private authService: AuthenticationService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email address.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };

  loginUser(value) {
    this.loginSpinner = true;

    this.authService.loginUser(value)
    .then(res => {
      if(res.user.emailVerified) {
        this.errorMessage = "";
        this.loginSpinner = false;
        this.ngZone.run(() => this.router.navigate(['/home'])).then();
      } else {
        this.errorMessage = "Follow the link from your e-mail address to verify your account.";
        this.loginSpinner = false;
        setTimeout(() => {
          this.errorMessage = "";
        }, 5000);
      }
    }, err => {
      this.errorMessage = err.message;
      this.loginSpinner = false;
      setTimeout(() => {
        this.errorMessage = "";
      }, 5000);
    });
  }

  goToRegisterPage() {
    this.loginSpinner = false;
    this.ngZone.run(() => this.router.navigate(['/register'])).then();
  }

}
