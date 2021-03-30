import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  registerSpinner: boolean = false;

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email address.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 6 characters long.' }
    ]
  };

  constructor(private ngZone: NgZone, private router: Router, private authService: AuthenticationService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  tryRegister(value) {
    this.registerSpinner = true;

    this.authService.registerUser(value)
    .then(res => {
      this.errorMessage = "";
      this.registerSpinner = false;
      this.successMessage = "Please follow the link in the verification e-mail to activate your account.";
      setTimeout(() => {
        this.successMessage = "";
        this.errorMessage = "";
      }, 5000);
    }, err => {
      this.errorMessage = err.message;
      this.registerSpinner = false;
      this.successMessage = "";
      setTimeout(() => {
        this.errorMessage = "";
        this.successMessage = "";
      }, 5000);
    });
  }

  goToLoginPage() {
    this.registerSpinner = false;
    this.ngZone.run(() => this.router.navigate(['/login'])).then();
  }

}
