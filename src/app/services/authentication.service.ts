import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor() { }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
     firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
     .then(
       res => {
          res.user.sendEmailVerification().then((ress) => {
            resolve(ress);
          }).catch((error) => {
            reject(error);
          });
       },
       err => reject(err))
    })
  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
     firebase.auth().signInWithEmailAndPassword(value.email, value.password)
     .then(
        res => resolve(res),
        err => reject(err))
    })
  }

  logoutUser() {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
      .then(() => {
        resolve();
      }).catch((error) => {
        reject();
      });
    });
  }

  getUser() {
    return firebase.auth().currentUser;
  }

  updateDisplayName(value) {
    return new Promise<any>((resolve, reject) => {
      let user = this.getUser();
      user.updateProfile({
        displayName: value.name
      }).then((res) => {
        resolve(res);
      }, (error) => {
        reject(error);
      });
      // resolve();
    });
  }

  updateProfileImage(imageURL) {
    return new Promise<any>((resolve, reject) => {
      let user = this.getUser();
      user.updateProfile({
        photoURL: imageURL
      }).then((res) => {
        resolve(res);
      }, (error) => {
        reject(error);
      });
    });
  }

}
