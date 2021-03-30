import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FormsModule, FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';

import { AuthenticationService } from '../services/authentication.service';
import { ParkingSpotsService } from '../services/parkingspots.service';

import * as firebase from 'firebase/app';

import anime from 'animejs/lib/anime.es.js';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('mapElement', {static: true}) mapElement: ElementRef;
  map: any;
  mapOptions: any = {
    zoom: 17,
    disableDefaultUI: true,
    styles: [{"elementType":"geometry","stylers":[{"color":"#f5f5f5"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#f5f5f5"}]},{"featureType":"administrative.land_parcel","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"lightness":40},{"weight":1}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#dadada"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#e5e5e5"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"color":"#eeeeee"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#c9c9c9"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]}]
  };
  parkingSpots: any[] = [];
  parkingSpotsMarkers: any[] = [];
  currentLocationLatLng: any = new google.maps.LatLng(0, 0);
  currentLocationMarker: any;
  setMapCenter: boolean = false;

  lightboxSlideOptions: any = {
    initialSlide: 0,
    speed: 400
  };
  getStartedOnboarding: boolean = false;
  completeProfile: boolean = false;
  completeProfileSpinner: boolean = false;
  profileImagePlaceholder: string = '../assets/img/profile-placeholder.png';
  addParkingSpotOnboarding: boolean = false;
  addParkingSpotSpinner: boolean = false;
  parkingSpotChooseTime: boolean = false;

  validations_form: FormGroup;
  errorMessage: string = '';

  currentUser: any = {};
  currentUserPhotoURL: string = '';

  chosenProfileImage: string = '';

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private geolocation: Geolocation,
    private keyboard: Keyboard,
    private authService: AuthenticationService,
    private parkingspotsService: ParkingSpotsService,
    private formBuilder: FormBuilder,
    private camera: Camera,
    private localNotifications: LocalNotifications
  ) { }

  loadMap() {
    // Get Parking Spots
    this.parkingspotsService.getParkingSpots().subscribe(data => {
      this.parkingSpots = data.map(e => {
        return {
          id: e.payload.doc.id,
          userID: e.payload.doc.data()['userID'],
          lat: e.payload.doc.data()['lat'],
          lng: e.payload.doc.data()['lng'],
          hours: e.payload.doc.data()['hours'],
          minutes: e.payload.doc.data()['minutes']
        };
      });

      for(let i = 0; i < this.parkingSpotsMarkers.length; i++) {
        this.parkingSpotsMarkers[i].setMap(null);
      }
      this.parkingSpotsMarkers = data.map(e => {
        return new google.maps.Marker({
          id: e.payload.doc.id,
          position: new google.maps.LatLng(e.payload.doc.data()['lat'], e.payload.doc.data()['lng']),
          zIndex: 1,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#f1c40f',
            fillOpacity: 1,
            strokeWeight: 20,
            strokeColor: '#f1c40f',
            strokeOpacity: 0.15,
            scale: 7
          },
          animation: google.maps.Animation.DROP,
          map: this.map
        });
      });
    });

    this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);
    this.currentLocationMarker = new google.maps.Marker({
      position: this.currentLocationLatLng,
      zIndex: 2,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4e86ee',
        fillOpacity: 1,
        strokeWeight: 30,
        strokeColor: '#4e86ee',
        strokeOpacity: 0.15,
        scale: 8
      },
      animation: google.maps.Animation.DROP,
      map: this.map
    });


    this.watchLocation();
  }

  watchLocation() {
    this.geolocation.watchPosition({
      enableHighAccuracy: true
    }).subscribe((position) => {
      this.currentLocationLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      if(this.setMapCenter == false) {
        this.map.setCenter(this.currentLocationLatLng);
        this.setMapCenter = true;
      }
      this.currentLocationMarker.setPosition(this.currentLocationLatLng);

      // Center Current Location Marker
      google.maps.event.addListener(this.currentLocationMarker, 'click', () => {
        this.map.setCenter(this.currentLocationMarker.getPosition());
        this.map.setZoom(18);
      });

      // Zoom Changed
      google.maps.event.addListener(this.map, 'zoom_changed', () => {
        let zoom = this.map.getZoom();
        for(let i = 0; i < this.parkingSpotsMarkers.length; i++) {
          if(zoom <= 15) {
            this.parkingSpotsMarkers[i].setMap(null);
          } else {
            this.parkingSpotsMarkers[i].setMap(this.map);
          }
        }
      });
    });
  }

  centerMapCurrentLocation() {
    this.map.setCenter(this.currentLocationLatLng);
  }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      name: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });

    if(this.authService.getUser()) {
      let user = this.authService.getUser();
      if(user.displayName != null) {
        this.currentUser = this.authService.getUser();
        if(this.currentUser.photoURL != null) {
          this.currentUserPhotoURL = this.currentUser.photoURL;
        } else {
          this.currentUserPhotoURL = this.profileImagePlaceholder;
        }

        this.loadMap();
      } else {
        this.getStartedOnboarding = true;
      }
    }
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' },
      { type: 'minlength', message: 'Name must be at least 5 characters long.' }
    ]
  };

  // Log out
  logout() {
    this.authService.logoutUser()
    .then(res => {
      this.ngZone.run(() => this.router.navigate(['/login'])).then();
    })
    .catch(error => {
      console.log(error);
    });
  }

  // Side Menu
  sideMenuToggled: boolean = false;
  sideMenuBtnIcon: string = 'menu';
  searchInputPosition: string = 'fixed';
  overlayBottomPosition: string = 'fixed';
  toggleSideMenu() {
    if(this.sideMenuToggled == false) {
      anime({
        targets: '.side-menu',
        left: '0%',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      anime({
        targets: '.map-overlay',
        left: '80%',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      this.sideMenuBtnIcon = 'arrow-forward';
      this.sideMenuToggled = true;
      this.searchInputPosition = 'absolute';
      this.overlayBottomPosition = 'absolute';
    } else {
      anime({
        targets: '.side-menu',
        left: '-80%',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      anime({
        targets: '.map-overlay',
        left: '0%',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      this.sideMenuBtnIcon = 'menu';
      this.sideMenuToggled = false;
      this.searchInputPosition = 'fixed';
      this.overlayBottomPosition = 'fixed';
    }
  }

  // Bottom Menu
  bottomMenuToggled: boolean = false;
  toggleBottomMenu() {
    if(this.bottomMenuToggled == false) {
      anime({
        targets: '.map-overlay-search',
        bottom: '0vh',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      this.bottomMenuToggled = true;
    } else {
      anime({
        targets: '.map-overlay-search',
        bottom: 'calc(-70vh + 85px)',
        duration: 200,
        easing: 'cubicBezier(.5, .05, .1, .3)'
      });
      this.bottomMenuToggled = false;
    }
  }

  // Search Input
  searchInputIcon: string = 'search';
  searchInputFocus() {
    this.keyboard.show();
    this.searchInputIcon = 'close-circle';
  }
  searchInputBlur() {
    this.keyboard.hide();
    this.searchInputIcon = 'search';
  }
  hideSearchKeyboard() {
    this.keyboard.hide();
  }

  // Open Add Parking Spot
  openAddParkingSpot() {
    this.map.setZoom(18);
    this.addParkingSpotOnboarding = true;
  }

  // Complete Profile Onboarding
  completeProfileFunction() {
    this.getStartedOnboarding = false;
    this.completeProfile = true;
  }

  // Upload Profile Image
  uploadProfileImage() {
    let imageName = 'user-' + new Date().getTime() + '.jpg';
    let fileRef = firebase.storage().ref('accounts/' + imageName);
    return fileRef.putString(this.chosenProfileImage, 'data_url', { contentType: 'image/jpeg' })
    .then(() => {
      return fileRef.getDownloadURL().then(downloadURL => {
        this.authService.updateProfileImage(downloadURL)
        .then(res => {
          //
        }, err => {
          //
        });
      });
    });
  }

  chooseProfileImage() {
    let options: CameraOptions = {
      quality: 80,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 256,
      targetHeight: 256,
      sourceType: 0
    };
    this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.profileImagePlaceholder = base64Image;
      this.chosenProfileImage = base64Image;
    }, (err) => { });
  }

  // Submit Complete Profile
  submitCompleteProfile(value) {
    this.completeProfileSpinner = true;

    this.authService.updateDisplayName(value).then(res => {
      this.uploadProfileImage();
      this.currentUser = this.authService.getUser();
      this.completeProfile = false;
      this.completeProfileSpinner = false;
      this.loadMap();
    }, err => {
      this.completeProfileSpinner = false;
    });
    this.currentUser = this.authService.getUser();
    this.completeProfile = false;
    this.loadMap();
  }

  // Close Add Parking Spot Onboarding
  closeAddParkingSpotOnboarding() {
    this.addParkingSpotOnboarding = false;
    this.parkingSpotChooseTime = true;
  }

  // Parking Time
  parkingTimeHours: number = 0;
  parkingTimeMinutes: number = 15;
  parkingTimeSelected: number = 1; // 0 -> Hours, 1 -> Minutes
  selectParkingTime(s) {
    this.parkingTimeSelected = s;
  }
  decreaseParkingTime() {
    if(this.parkingTimeSelected == 0) {
      if(this.parkingTimeHours > 0) {
        this.parkingTimeHours -= 1;
      }
    } else {
      if(this.parkingTimeMinutes > 5) {
        this.parkingTimeMinutes -= 5;
      }
    }
  }
  increaseParkingTime() {
    if(this.parkingTimeSelected == 0) {
      if(this.parkingTimeHours < 24) {
        this.parkingTimeHours += 1;
      }
    } else {
      if(this.parkingTimeMinutes < 55) {
        this.parkingTimeMinutes += 5;
      } else {
        if(this.parkingTimeHours < 24) {
          this.parkingTimeHours += 1;
          this.parkingTimeMinutes = 0;
        }
      }
    }
  }

  // Cancel Add Parking Spot
  cancelAddParkingSpot() {
    this.parkingSpotChooseTime = false;
  }

  // Submit Add Parking Spot
  submitAddParkingSpot() {
    this.addParkingSpotSpinner = true;

    let parkingSpotData = {};
    parkingSpotData['userID'] = this.currentUser.uid;
    parkingSpotData['lat'] = this.currentLocationLatLng.lat();
    parkingSpotData['lng'] = this.currentLocationLatLng.lng();
    parkingSpotData['hours'] = this.parkingTimeHours;
    parkingSpotData['minutes'] = this.parkingTimeMinutes;
    this.parkingspotsService.addParkingSpot(parkingSpotData).then(res => {
      let notificationTrigger: any = { in: 5, unit: 'minute' };
      if(this.parkingTimeHours > 0) {
        notificationTrigger.in = this.parkingTimeHours;
        notificationTrigger.unit = 'hour';
      } else {
        notificationTrigger.in = this.parkingTimeMinutes;
        notificationTrigger.unit = 'minute';
      }

      this.localNotifications.schedule({
        title: 'Parking Time',
        text: 'Your parking time will expire soon!',
        trigger: notificationTrigger
      });

      this.addParkingSpotSpinner = false;
      this.parkingSpotChooseTime = false;
    })
    .catch(err => {
      this.addParkingSpotSpinner = false;
      console.log(err);
    });
  }

}
