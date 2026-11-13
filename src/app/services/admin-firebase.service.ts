import { Injectable, NgZone, inject } from '@angular/core';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';


import { ActionCodeSettings, browserLocalPersistence, browserSessionPersistence, isSignInWithEmailLink, linkWithCredential, onAuthStateChanged, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signInWithPopup, signOut, UserInfo, GoogleAuthProvider, User, EmailAuthProvider } from 'firebase/auth';// '@angular/fire/auth'; //

import { collection, where, query, limit, QuerySnapshot, serverTimestamp, Timestamp, getDocsFromServer, orderBy, startAfter, setDoc, doc, writeBatch, getCountFromServer, getDoc, getDocFromServer, runTransaction } from 'firebase/firestore';// '@angular/fire/firestore';  //'firebase/firestore';  // If these are imported from '@angular/fire/firestore' you get warning called outside of injection context


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
import { DateTimeConstants } from '../classes/static/constants';

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
  // ------------------------------
  private organisationsList: FsOrganisation[] = null;
  // private fbGridGeneratorGotOnline = false;
  private listGotDateO = 0;
  // ------------------------------
  private businessList: FsBusinessList[] = null;
  private listGotDateB = 0;
  private activeOrgId = '';
  // ------------------------------
  private gatewaysList: FsGateway[] = null;
  private listGotDateG = 0;
  private activeBId = '';
  // ------------------------------



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

  getOrganisationsList$(): Observable<FsOrganisation[]> {
    // For different classes change data name from 'grid-generator' and table object must have - TAG AND NAME so Firestore index works
    try {

      if (this.isOnline && (this.listGotDateO === 0 || this.listGotDateO < DB.getMilliNowNumber() - DateTimeConstants.msInDay)) {
        return from(getDocsFromServer(query(collection(this.fireStoreDB, 'organisations'))))
          .pipe(
            first()
            , map(doc => {
              this.organisationsList = doc.docs.map(d => d.data() as FsOrganisation);
              this.organisationsList.sort((a, b) => a.name.localeCompare(b.name));
              this.listGotDateO = DB.getMilliNowNumber();
              return this.organisationsList;
            }), retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'get organisations list from the Firestore online DB'))
          );
      } else {
        // maybe null
        return of(this.organisationsList);
      }
    } catch (e: any) {
      return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'get organisations list'));
    }

  }

  getBusinessList$(orgId: string): Observable<FsBusinessList[]> {
    // For different classes change data name from 'grid-generator' and table object must have - TAG AND NAME so Firestore index works
    try {

      if (this.isOnline && (orgId !== this.activeOrgId || this.listGotDateB === 0 || this.listGotDateB < DB.getMilliNowNumber() - DateTimeConstants.msInDay)) {
        return from(getDocsFromServer(query(collection(this.fireStoreDB, 'organisations', orgId, 'businessList'))))
          .pipe(
            first()
            , map(doc => {
              this.businessList = doc.docs.map(d => d.data() as FsBusinessList);
              this.businessList.sort((a, b) => a.name.localeCompare(b.name));
              this.listGotDateB = DB.getMilliNowNumber();
              this.activeOrgId = orgId;
              return this.businessList;
            }), retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'get business list from the Firestore online DB'))
          );
      } else {
        // maybe null
        return of((orgId === this.activeOrgId) ? this.businessList : null);
      }
    } catch (e: any) {
      return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'get business list'));
    }

  }

  getGatewaysList$(bId: string): Observable<FsGateway[]> {
    // For different classes change data name from 'grid-generator' and table object must have - TAG AND NAME so Firestore index works
    try {

      if (this.isOnline && (bId !== this.activeBId || this.listGotDateG === 0 || this.listGotDateG < DB.getMilliNowNumber() - DateTimeConstants.msInDay)) {
        return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('bId', '==', bId))))
          .pipe(
            first()
            , map(doc => {
              this.gatewaysList = doc.docs.map(d => d.data() as FsGateway);
              this.gatewaysList.sort((a, b) => a.email.localeCompare(b.email));
              this.listGotDateG = DB.getMilliNowNumber();
              this.activeBId = bId;
              return this.gatewaysList;
            }), retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'get gateways list from the Firestore online DB'))
          );
      } else {
        // maybe null
        return of((bId === this.activeBId) ? this.gatewaysList : null);
      }
    } catch (e: any) {
      return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'get gateways list'));
    }

  }


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

  renameGateways$(): Observable<FsGateway[]> {
    try {
      return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'))))
        .pipe(
          first()
          , map(doc => {
            doc.docs.forEach(dd => {
              this.changeDocumentId('gateway', dd.id, dd.data()['id']);
            });
          })
          , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - enterprise list'));
    }
  }

  async changeDocumentId(collectionName: string, oldId: string, newId: string) {
    const oldDocRef = doc(this.fireStoreDB, collectionName, oldId);
    const newDocRef = doc(this.fireStoreDB, collectionName, newId);

    await runTransaction(this.fireStoreDB, async (transaction) => {
      const oldDocSnap = await transaction.get(oldDocRef);
      if (!oldDocSnap.exists()) {
        throw new Error("Source document does not exist!");
      }

      const data = oldDocSnap.data();

      // 1. Write data to the new document ID
      transaction.set(newDocRef, data);

      // 2. Delete the old document
      transaction.delete(oldDocRef);
    });
    const t = 0;

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
