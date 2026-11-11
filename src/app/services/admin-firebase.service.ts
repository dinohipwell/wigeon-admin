import { Injectable, NgZone, inject } from '@angular/core';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';


import { ActionCodeSettings, browserLocalPersistence, browserSessionPersistence, isSignInWithEmailLink, linkWithCredential, onAuthStateChanged, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signInWithPopup, signOut, UserInfo, GoogleAuthProvider, User, EmailAuthProvider } from 'firebase/auth';// '@angular/fire/auth'; //

import { collection, where, query, limit, QuerySnapshot, serverTimestamp, Timestamp, getDocsFromServer, orderBy, startAfter, setDoc, doc, writeBatch, getCountFromServer, getDoc, getDocFromServer } from 'firebase/firestore';// '@angular/fire/firestore';  //'firebase/firestore';  // If these are imported from '@angular/fire/firestore' you get warning called outside of injection context


import { catchError, concatMap, defaultIfEmpty, filter, first, forkJoin, from, map, mergeAll, mergeMap, observable, Observable, of, switchMap, takeUntil, throwError, expand, Subject, timer, scheduled, toArray, Subscription, retry } from 'rxjs';
import { EMPTY } from 'rxjs';
import { StateService } from './state.service';
import { FsUser } from '../classes/class-dto/user';
import { OnlineService } from './online.service';
import { ErrorService, LoggedError } from './error.service';
import { FsOrganisation, Organisation } from '../classes/class-dto/organisation';

import * as CryptoJS from 'crypto-js';
import { DB } from '../classes/static/db.static';
import { EnvConfigService } from './env-config.service';
import { FsGateway } from '../classes/class-dto/gateway';
import { BusinessGroup, BusinessPickerItem, FsBusinessList } from '../classes/class-dto/business';

declare const gapi: any;


@Injectable({
  providedIn: 'root'
})

export class AdminFirebaseService {
  private errorService = inject(ErrorService);
  private stateService = inject(StateService);
  private onlineService = inject(OnlineService);

  private fireStoreDB = inject(Firestore);

  private fireAuth = inject(Auth);

  private isOnline = false;
  private isLoggedIn = 0;


  constructor() {

    this.onlineService.connectionChanged$.subscribe({
      next: (data: any) => {
        this.isOnline = data;
      }
    });

    this.stateService.loggedOnChanged$.subscribe({
      next: (data: number) => {
        this.isLoggedIn = data;
      }
    });
  }

  private fbOnlineCheckThrowLoggedError$(error: any, msg: string): Observable<any> {
    // used to globally replace depreciated throw Error(message)
    // both the below work BUT () => needs an extra ) adding to the end of the line so could not be globally changed
    //
    if ((error.code && error.code === 'unavailable') || (error instanceof TypeError && error.message && error.message === 'Failed to fetch')) {
      // internet MAYBE down trigger offlineService check and global reset
      if (this.isOnline) {
        this.onlineService.checkUpdateOnlineStatus();
      }
    }
    const x = this.errorService.processDataError(error, msg);
    return throwError(() => new LoggedError(x));
  }

  // getEmailNoUidGateway$(email: string): Observable<FsGateway[]> {
  //   try {
  //     return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('userId', '==', ''), where('email', '==', email))))
  //       .pipe(
  //         first(
  //           // ends after the first record is returned
  //         )
  //         , map((doc) => {
  //           const data: FsGateway[] = [];
  //           doc.docs.forEach(d => data.push(d.data() as FsGateway));
  //           return data;
  //         })
  //         , retry({ count: 2, delay: 2000 })
  //         , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
  //   }
  //   catch (error: any) {
  //     return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - business gateways by email'));
  //   }
  // }

  // getUidBidGateway$(email: string): Observable<FsGateway[]> {
  //   try {
  //     return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('userId', '==', 'xxx'), where('bId', '==', 'aaaaaaa'))))
  //       .pipe(
  //         first(
  //           // ends after the first record is returned
  //         )
  //         , map((doc) => {
  //           const data: FsGateway[] = [];
  //           doc.docs.forEach(d => data.push(d.data() as FsGateway));
  //           return data;
  //         })
  //         , retry({ count: 2, delay: 2000 })
  //         , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
  //   }
  //   catch (error: any) {
  //     return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - business gateways by email'));
  //   }
  // }

  getUsersByEmail$(email: string): Observable<FsUser[]> {
    try {
      return from(getDocsFromServer(query(collection(this.fireStoreDB, 'users'), where('email', '==', email))))
        .pipe(
          first(
            // ends after the first record is returned
          )
          , map((doc) => {
            return doc.docs.map(d => d.data() as FsUser);

          })
          , retry({ count: 2, delay: 2000 })
          , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - enterprise list'));
    }
  }

  getGatewayList$(userId: string, email: string): Observable<FsGateway[]> {
    try {
      return forkJoin([
        from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('userId', '==', userId))))
          .pipe(
            first()
            , mergeMap((doc: QuerySnapshot) => {
              return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('email', '==', email), where('userId', '==', ''))))
                .pipe(
                  first()
                  , map((doc2: QuerySnapshot) => {
                    const data: FsGateway[] = [];
                    if (doc) {
                      data.push(...doc.docs.map(d => d.data() as FsGateway));
                    }
                    if (doc2) {
                      data.push(...doc2.docs.map(d => d.data() as FsGateway))
                    }
                    return data;

                  })
                  , retry({ count: 2, delay: 2000 })
                  , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore user gateways')))

            })
            , retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firebase user gateway')))
      ]).pipe(defaultIfEmpty([]), map(x => { return x[0] })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firebase gateways')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data from the online Firestore DB - gateway users'));
    }
  }

  getOrgBusinessList$(orgId: string, bizList: string[], gateways: FsGateway[]): Observable<FsBusinessList> {
    // didn't like the last id string in the chani rather than a where
    return from(getDocsFromServer(query(collection(this.fireStoreDB, 'organisations', orgId, 'businessList'), where('bId', 'in', bizList))))
      .pipe(
        map((doc) => {
          return doc.docs.map(d => d.data() as FsBusinessList);
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get online Firestore business list')));

  }


}
