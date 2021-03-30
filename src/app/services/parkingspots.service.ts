import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ParkingSpotsService {

  constructor(private firestore: AngularFirestore) { }

  addParkingSpot(parkingSpotData) {
    return this.firestore.collection('parkingSpots').add(parkingSpotData);
  }

  getParkingSpots() {
    return this.firestore.collection('parkingSpots').snapshotChanges();
  }

  getParkingSpot(parkingSpotID) {
    return this.firestore.collection('parkingSpots/' + parkingSpotID).valueChanges();
  }

  updateParkingSpot(parkingSpotID, parkingSpotData) {
    this.firestore.doc('parkingSpots/' + parkingSpotID).update(parkingSpotData);
  }

  deleteParkingSpot(parkingSpotID) {
    this.firestore.doc('parkingSpots/' + parkingSpotID).delete();
  }

}
