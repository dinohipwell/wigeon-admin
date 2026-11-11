import { Injectable, NgZone, inject } from '@angular/core';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { Firestore } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';


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
import { idTokenResult } from '@angular/fire/auth-guard';

declare const gapi: any;


@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  private errorService = inject(ErrorService);
  private stateService = inject(StateService);
  private onlineService = inject(OnlineService);

  private fireStoreDB = inject(Firestore);

  private fireAuth = inject(Auth);

  // public userOrganisation: Organisation=null; // set when business selected



  private key = '019d2099-d546-77e8-9b93-9c3206ba0b30';
  // ==========================================
  // Firestore Syntax
  // https://medium.com/@aayyash/putting-angular-fire-firestore-library-to-use-i-7df3238600bd
  // The or format looks like this: query(ref, or(where(), where() ...),
  // and a combination may look like this query(ref, and(where(), where(), or(where(), but and is default so not needed
  //
  //
  // ==========================================


  private isOnline = false;
  private isLoggedIn = 0;
  private testCount = 0;

  constructor() {// Initialize Firebase
    // const app = initializeApp(environment.firebase);
    // // Initialize Cloud Firestore and get a reference to the service
    // this.fireStoreDB = getFirestore(app);
    // this.fireAuth = getAuth(app);

    this.fireAuth.setPersistence(browserLocalPersistence).then(e => { });
    // this.fireStoreDB.app.options.
    //  this.setSessionStoragePersistence(); browserSessionPersistence    was browserLocalPersistence
    // ERROR RuntimeError: NG0203: The `EnvironmentInjector` token injection failed. `inject()` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://v20.angular.dev/errors/NG0203
    // this.angularFireAuth.onIdTokenChanged((user) => {



    // user(this.fireAuth)
    //   .pipe(
    //     switchMap((currentUser: User) => {
    //       if (!currentUser) return of(null);
    //       return from(currentUser.getIdTokenResult()).pipe(
    //         map((token) => (token.claims['activeBId'] as string) || null)
    //       );
    //     })
    //   )
    //   .subscribe((claimTenantId) => {
    //     let activeTenantId = '';
    //     // if (claimTenantId && activeTenantId !== claimTenantId) {
    //     //   activeTenantId=claimTenantId;
    //     // }
    //   });

    onAuthStateChanged(this.fireAuth, (user: User) => {
      if (user) {
        // User is signed in or token was refreshed.
        // may be fired at the app start or page refresh

        // get user defined token
        from(user.getIdTokenResult()).pipe().subscribe((token) => {
          // undefined if not in token
          const b = token.claims['activeBId'];
          const r = token.claims['rights'];

          this.getAuthorisedUser$(user.uid).subscribe({
            next: (data) => {
              if (data === 1) {
                this.stateService.setIsLoggedIn(11); // must set uid and email first
              } else {
                this.stateService.setIsLoggedIn(0);
              }
            }, error: (err: any) => {
              // in list
              this.stateService.setIsLoggedIn(0);
            }
          }); // let error cscade
        });

      } else {
        this.stateService.setIsLoggedIn(0);
      }
    });


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


  // private fbThrowError$(error: any, m: string): Observable<any> {
  //   // used to globally replace depreciated throw Error(message)
  //   if ((error.code && error.code === 'unavailable') || (error instanceof TypeError && error.message && error.message === 'Failed to fetch')) {
  //     // internet MAYBE down trigger offlineService check and global reset
  //     if (this.isOnline) {
  //       // this.onlineService.checkUpdateOnlineStatusTest(false);
  //       this.onlineService.checkUpdateOnlineStatus();
  //     }
  //   }
  //   m = this.errorService.extractErrorMessage(error, m);
  //   return throwError(() => new Error(m));
  // }

  private fbOnlineCheckThrowLoggedError$(error: any, msg: string): Observable<any> {
    // used to globally replace depreciated throw Error(message)
    // both the below work BUT () => needs an extra ) adding to the end of the line so could not be globally changed
    //
    if ((error.code && error.code === 'unavailable') || (error instanceof TypeError && error.message && error.message === 'Failed to fetch')) {
      // internet MAYBE down trigger offlineService check and global reset
      if (this.isOnline) {
        // this.onlineService.checkUpdateOnlineStatusTest(false);
        this.onlineService.checkUpdateOnlineStatus();
      }
    }
    const x = this.errorService.processDataError(error, msg);
    return throwError(() => new LoggedError(x));
  }

  setLocalStorageUser(user: FsUser) {
    try {
      localStorage.setItem('wigeon_last_user', JSON.stringify(user));
    } catch (e) {
    }
  }

  setLocalStorageLogin(email: string, resetPin: boolean): [boolean, string] {
    try {
      // const bcrypt = require('bcrypt');
      // bcrypt.hash(password, 12).then((hash: any) => {
      const tup = this.getLocalStorageLogin();
      if (!resetPin && tup[0] && tup[0].email === email && tup[1]) {
        // use existing
        return [false, CryptoJS.AES.decrypt(tup[1], this.key).toString(CryptoJS.enc.Utf8)];
      }
      // make a new guid password for local use
      const p = DB.generatePin6();
      const hash = CryptoJS.AES.encrypt(p, this.key).toString();
      // Store hash in your password DB.
      // user will be saved sepperately
      localStorage.setItem('wigeon_last_pass', hash);
      return [true, p];
    } catch (e) {
      return [false, ''];
    }
  }

  getLocalStorageLogin(): [FsUser, string] {
    try {
      let user: FsUser = null;
      const e = localStorage.getItem('wigeon_last_user');
      if (e) {
        user = JSON.parse(e);
      }
      const p = localStorage.getItem('wigeon_last_pass');
      return [user, p];
    } catch (err) {
      return [null, ''];
    }
  }

  testLocalStorage(): boolean {
    try {
      const j = 'Ok';
      localStorage.setItem('wigeon_check', j);
      const i = localStorage.getItem('wigeon_check');
      return (i === j);
    } catch (e) {
      return false;
    }
  }

  getUserProviders(): UserInfo[] {

    //return from(this.angularFireAuth.currentUser
    //    .then((user) => {
    //   return user.providerData;

    // }).catch((e: any) => {
    //   return this.errorService.throwLoggedError$(this.errorService.processDataError(e, ''));

    // }));
    return this.fireAuth.currentUser.providerData;

  }

  linkProviderPassword$(password: string): Observable<any | UserInfo[]> {
    try {
      const user = this.fireAuth.currentUser;
      // return from(this.angularFireAuth.currentUser
      //   .then((user) => {
      const credential = EmailAuthProvider.credential(user.email, password);
      // return from(user.linkWithCredential(credential)
      return from(linkWithCredential(user, credential)).pipe(
        map((usercred) => {
          return user.providerData;
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot link provider password'))
      );
      // .then((usercred) => {
      //   // var user = usercred.user;
      //   return user.providerData;

      // }).catch((e: any) => {

      //   return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Cannot add provider to user account'));
      // }));

    } catch (e: any) {

      return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Cannot get current user'));

    }
  }

  linkProviderPopup$(n: number): Observable<any | UserInfo[]> {

    try {
      const user = this.fireAuth.currentUser;
      let provider;
      // if (n === 1) {
      provider = new GoogleAuthProvider();
      //  provider = new firebase.auth.GoogleAuthProvider();
      // } else {
      //   // needs setting up with appid and secrete in Wigeon
      //   provider = new firebase.auth.FacebookAuthProvider();
      // }
      // var twitterProvider = new firebase.auth.TwitterAuthProvider();
      // var githubProvider = new firebase.auth.GithubAuthProvider();

      // return from(user.linkWithPopup(provider)
      return from(signInWithPopup(this.fireAuth, provider)).pipe(
        map((usercred) => {
          return user.providerData;
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot sign in with popup'))
      );
      // .then((usercred) => {
      //   // var user = usercred.user;
      //   return user.providerData;

      // }).catch((e: any) => {

      //   return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Cannot add provider to user account'));
      // }));

    } catch (e: any) {

      return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Cannot get current user'));

    }


  }


  sendEmailLink$(email: string): Observable<any> {
    // returns true when waiting for email
    const envConfigService = inject(EnvConfigService);
    const actionCodeSettings: ActionCodeSettings = {
      // url: 'https://localhost:4200/login',
      // http://localhost:4200/login?apiKey=AIzaSyA_BwzJTRAm_RYWag9rnTRZiq9apWLKGYw&oobCode=92570AOr0-PpBWLUi4-3p057owa4EOverXBqtPrMXd4AAAGa1XbdoA&mode=signIn&lang=en
      url: envConfigService.webUrl,
      handleCodeInApp: true
    }

    return from(sendSignInLinkToEmail(this.fireAuth, email, actionCodeSettings)
      .then((result) => {
        window.localStorage.setItem('emailForSignIn', email);
        return 1; // not of()
      }).catch((e: any) => {
        this.stateService.setIsLoggedIn(0);

        return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Google login error'));

      }));

  }

  confirmSignIn$(): Observable<any> {
    // returns true when logged in

    if (isSignInWithEmailLink(this.fireAuth, window.location.href)) {

      let email = window.localStorage.getItem('emailForSignIn');

      // Signin user and remove the email localStorage
      return from(signInWithEmailLink(this.fireAuth, email, window.location.href)
        .then((result) => {
          // this.angularFireAuth.signInWithRedirect(provider);
          // this.angularFireAuth.getRedirectResult().then((result) => {
          window.localStorage.removeItem('emailForSignIn');

          if (!result.user) {

            return this.errorService.throwLoggedError$('Email link login error');

          } else {
            return true; // not of()
          }
        })
        .catch((e: any) => {
          this.stateService.setIsLoggedIn(0);

          return this.errorService.throwLoggedError$(this.errorService.processDataError(e, 'Google login error'));
        }));
    } else {
      return of(false);
    }
  }



  googleLogin$(resetPin: boolean): Observable<[boolean, string]> {
    const provider = new GoogleAuthProvider();
    // with popup
    return from(signInWithPopup(this.fireAuth, provider)

      .then((result) => {
        if (!result.user) {
          throw new LoggedError(this.errorService.processMessage('Google-Login error'));
        } else {
          return this.setLocalStorageLogin(result.user.email, resetPin);
          // not of()
        }
      })
      .catch((e: any) => {
        this.stateService.setIsLoggedIn(0);
        throw new LoggedError(this.errorService.processDataError(e, 'Google login error'));

      }));
    // with redirect
    // firebase.auth().signInWithRedirect(provider);

  }

  passwordLoginOffline(email: string, password: string): number {
    let ret = 0;
    const tup = this.getLocalStorageLogin();
    if (tup[0] && tup[1] && tup[0].email === email) {
      if (this.stateService.isDebugBuild() || password === CryptoJS.AES.decrypt(tup[1], this.key).toString(CryptoJS.enc.Utf8)) {

        this.setUser(tup[0]);
        this.stateService.setIsLoggedIn(1);
        ret = 1;
      }

    }

    return ret;
  }


  passwordLogin$(email: string, password: string, resetPin: boolean): Observable<[boolean, string]> {
    const provider = new GoogleAuthProvider();
    // provider.setCustomParameters({ 'ownerId': 'qwe123' });
    // provider.addScope('userId: qwe123');

    // with popup
    return from(signInWithEmailAndPassword(this.fireAuth, email, password)
      .then((result: any) => {
        if (!result.user) {
          throw new LoggedError(this.errorService.processMessage('Login error'));

        } else {
          // save make and return offline password
          return this.setLocalStorageLogin(email, resetPin);

        }
      })
      .catch((e: any) => {
        this.stateService.setIsLoggedIn(0);
        throw new LoggedError(this.errorService.processDataError(e, 'Login error'));
      }));

    // with redirect
    // firebase.auth().signInWithRedirect(provider);

  }

  // confirm email


  sendPasswordResetEmail$(email: string): Observable<number> {
    return from(sendPasswordResetEmail(this.fireAuth, email)
      .then(() => {
        // Password reset email sent!
        // ..
        return 1;
      })
      .catch((e: any) => {
        this.stateService.setIsLoggedIn(0);
        throw new LoggedError(this.errorService.processDataError(e, 'Request reset password email error'));

      }));
  }

  // sendPasswordResetEmail$(email: string): Observable<any> {
  //   //  this.angularFireAuth.fetchSignInMethodsForEmail
  //   return from(this.angularFireAuth. .sendEmailVerification()
  //     .then(() => {
  //       // Email verification sent!
  //       // ...

  //     .catch ((e: any) => {
  //         this.stateService.setIsLoggedIn(0);
  //          return this.errorService.throwLoggedError$(this.errorService.processDataError(e, ''));
  //       }));
  // }


  getAuthorisedUser$(userId: string): Observable<number> {

    // OFFLINE causes an error


    // not found raises an error and so user is not logged in

    // query so Rules needs an allow list or read
    //return from(getDocsFromServer(query(collection(this.fireStoreDB, 'users'), where('__name__', '==', userId), limit(1))))
    // const user = doc.docs[0].data() as FsUser

    // Rules uses an allow get or read
    const docRef = doc(this.fireStoreDB, 'users', userId);

    return from(getDocFromServer(docRef)).pipe(
      first(),
      map((doc) => {
        const user = doc.data() as FsUser
        if (user !== undefined && user) {

          this.setUser(user);
          this.setLocalStorageUser(user);

          return 1;
        } else {
          this.stateService.blankUser();
          return 0;
        }


      })
      , retry({ count: 2, delay: 2000 })
      , catchError((e: any) => {
        this.stateService.blankUser();
        return this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get authorised user');
      }));

  }

  private setUser(user: FsUser) {
    this.stateService.userId = user.userId;
    this.stateService.userEmail = user.email;

    this.stateService.userName = user.displayName;
    this.stateService.isDeveloper = user.rights > 63;
    this.stateService.isUserOrgAdmin = user.rights > 7;  // 8= orgadmin
    this.stateService.isUserBizAdmin = user.rights > 3; // 4=Biz admin
    this.stateService.isUser = user.rights > 1; // 2= by sub roles
    this.stateService.isUserRO = user.rights === 1; // readonly by sub roles
    // 0=no rights at all !isUser and !isUserRO

    this.stateService.userMemberOrgId = user.orgId;
    this.stateService.userRights = user.rights;
    this.stateService.userRole = user.role;
  }



  // private setSessionStoragePersistence(): void {
  //   setPersistence(this.fireAuth, browserSessionPersistence).then(() => { });
  // }

  // login(email: string, password: string): Observable<void> {
  //   const promise = signInWithEmailAndPassword(
  //     this.firebaseAuth,
  //     email,
  //     password
  //   ).then(() => {
  //     //
  //   });
  //   return from(promise);
  // }

  logout() {
    signOut(this.fireAuth).then(() => {
      // Sign-out successful.
      this.stateService.setIsLoggedIn(0);
      // croppingDataState.setCurrentBusiness(null);
      sessionStorage.clear();

    }).catch((error) => {
      // An error happened.
    });

  }


  checkOnlineBusiness$(orgId: string, bId: string): Observable<number> {
    try {
      return from(getCountFromServer(query(collection(this.fireStoreDB, 'orgdata', orgId, 'bizdata', bId, 'changesets'))))
        .pipe(first()
          , map((res) => {

            return res.data().count;
          })
          , retry({ count: 2, delay: 2000 })
          , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'check Firestore online business exists')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - business exists'));
    }
  }


  getBusinessGateways$(bId: string): Observable<FsGateway[]> {
    try {
      return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('bId', '==', bId))))
        .pipe(
          first(
            // ends after the first record is returned
          )
          , map((doc) => {
            const data: FsGateway[] = [];
            doc.docs.forEach(d => data.push(d.data() as FsGateway));
            return data;
          })
          , retry({ count: 2, delay: 2000 })
          , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - enterprise list'));
    }
  }

  getEmailNoUidGateway$(email: string): Observable<FsGateway[]> {
    try {
      return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('userId', '==', ''), where('email', '==', email))))
        .pipe(
          first(
            // ends after the first record is returned
          )
          , map((doc) => {
            const data: FsGateway[] = [];
            doc.docs.forEach(d => data.push(d.data() as FsGateway));
            return data;
          })
          , retry({ count: 2, delay: 2000 })
          , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online DB - business gateways by email'));
    }
  }

  getGateways$(): Observable<FsGateway[]> {
    //doesnt work
    try {
      const em = this.stateService.userEmail;
      return forkJoin([
        //this.angularFfireStore.collection<FsGateway>('gateway', ref => ref.where('userId', '==', this.stateService.userId)).valueChanges()
        from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('userId', '==', this.stateService.userId))))
          .pipe(
            first(
              // ends after the first record is returned
            ) // not needed if no records doc.docs is empty array, defaultIfEmpty(null)
            , mergeMap((doc: QuerySnapshot) => {
              // return this.angularFfireStore.collection<FsGateway>('gateway', ref => ref.where('userId', '==', '').where('email', '==', this.stateService.userEmail)).valueChanges()
              return from(getDocsFromServer(query(collection(this.fireStoreDB, 'gateway'), where('email', '==', em), where('userId', '==', ''))))
                .pipe(
                  first(
                    // ends after the first record is returned
                  )
                  , map((doc2: QuerySnapshot) => {
                    const data: FsGateway[] = [];
                    if (doc) {
                      doc.docs.forEach(d => data.push(d.data() as FsGateway));
                    }

                    if (doc2) {
                      const data2: FsGateway[] = [];
                      doc2.docs.forEach(d => data2.push(d.data() as FsGateway));
                      if (data2.length > 0) {
                        data.push(...data2);
                      }
                    }
                    return data;

                  })
                  , retry({ count: 2, delay: 2000 })
                  , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firestore business gateways')))

            })
            , retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firebase users')))
      ]).pipe(defaultIfEmpty([]), map(x => { return x[0] })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot fetch Firebase gateway users')));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online Firestore DB - gateway users'));
    }
  }

  getFsOrganisation$(orgId: string): Observable<FsOrganisation> {

    const docRef = doc(this.fireStoreDB, 'organisations', orgId);
    return from(getDocFromServer(docRef)).pipe(first(), map(doc => {
      return doc.data() as FsOrganisation;
    })
      , retry({ count: 2, delay: 2000 })
      , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get Firestore organisation')));

  }

  getOnlineOrganisation$(orgList: string[], orgs: Organisation[]): Observable<Organisation[]> {
    try {
      if (orgList.length > 0) {
        // return this.angularFfireStore.collection<FsOrganisation>('organisations', ref => ref.where('docId', 'in', orgList)).valueChanges()
        return from(getDocsFromServer(query(collection(this.fireStoreDB, 'organisations'), where('docId', 'in', orgList))))
          .pipe(
            //, defaultIfEmpty([])
            concatMap((doc) => {
              // empty array if non found
              // is array of possible businesses
              const data: Organisation[] = [];
              doc.docs.forEach(d => {
                const fo = d.data() as FsOrganisation;
                data.push(new Organisation(fo.docId, fo.name))
              });
              data.forEach(o => orgs.push(new Organisation(o.docId, o.name)));
              return data;
            })
            , retry({ count: 2, delay: 2000 })
            , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get Firestore enterprise list')));
      } else {
        return of([]);
      }

    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'get this data to the online Firestore DB - enterprise list'));
    }
  }

  getAndProcessOnlineBusinessList$(org: Organisation, bizList: string[], gateways: FsGateway[]): Observable<FsBusinessList> {
    // didn't like the last id string in the chani rather than a where
    return from(getDocsFromServer(query(collection(this.fireStoreDB, 'organisations', org.docId, 'businessList'), where('bId', 'in', bizList))))
      .pipe(
        concatMap((doc) => {
          const data: FsBusinessList[] = [];
          doc.docs.forEach(d => {
            const bl = d.data() as FsBusinessList;
            // ignore deleted bizs
            if (bl.status < 1000) {
              data.push(bl);
              // owned single/shared // collaboration
              gateways.filter(gateWay => gateWay.bId === bl.bId).forEach(gateWay => {
                // you may share with youirself so get second instance of the biz name
                this.addBizLIstItemToOrgGroup(org, bl, gateWay);
              });
            }
          });
          return of(data);
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get online Firestore business list')));

  }

  private addBizLIstItemToOrgGroup(o: Organisation, bl: FsBusinessList, gateWay: FsGateway) {

    let rTpe = 30; // gateWayRight===4+ business addmin

    // caluclate what typ eof group to display this business in
    // if (bl.status > 1000) {
    //   rTpe = 1001;
    // } else
    if (gateWay.userId === '') {
      rTpe = 5;
    } else if (gateWay.rights >= 4 && bl.shared) {
      rTpe = 35; // business admin+
    } else if (gateWay.rights === 1) {
      if (gateWay.role === 'A' || gateWay.role === 'C' || gateWay.role === 'V') {
        rTpe = 60;
      } else {
        rTpe = 50;
      }


    } else if (gateWay.rights === 2) {
      rTpe = 40;
    } else if (gateWay.rights === 99) { // ???not sure why this is needed - maybe for pre purchase user
      rTpe = 99;

    }



    let bg = o.businessGrpList.find(g => g.rTpe === rTpe);
    if (bg === undefined) {
      bg = new BusinessGroup(rTpe);
      o.businessGrpList.push(bg);
    }
    bg.businessPickerList.push(new BusinessPickerItem(bl, gateWay));

  }

  updateBusinessListItem$(bl: FsBusinessList): Observable<any> {
    const obs$: Observable<any>[] = [];
    try {

      const batch = writeBatch(this.fireStoreDB)

      batch.set(doc(this.fireStoreDB, 'organisations', bl.orgId, 'businessList', bl.bId), Object.assign({}, bl));
      return from(batch.commit()).pipe(
        map(() => {
          return;
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot update online Firestore business record'))
      );
      // .then(() => {
      //   return

      // })
      // .catch(e => {
      //   this.fbOnlineCheckThrowLoggedError$(e, 'Cannot update online business record')
      // }));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'save this data to the online DB - Business'));
    }
  }

  deleteGatewayRequest$(gateway: FsGateway, bl: FsBusinessList): Observable<any> {
    const obs$: Observable<any>[] = [];

    try {
      const batch = writeBatch(this.fireStoreDB)

      // path is only for a record that has not been accepted yet

      const gkDoc = doc(this.fireStoreDB, 'gateway', ((gateway.userId === '' || gateway.userId === 'x') ? gateway.email : gateway.userId) + gateway.bId);
      batch.delete(gkDoc);

      // update shared count
      batch.set(doc(this.fireStoreDB, 'organisations', bl.orgId, 'businessList', bl.bId), Object.assign({}, bl));

      return from(batch.commit()).pipe(
        map(() => {
          return;
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot delete online Firestore business collaboration request'))
      );
      // .then(() => {
      //   return

      // }).catch(e => {
      //   this.fbOnlineCheckThrowLoggedError$(e, 'Cannot delete business collaboration request')
      // }));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'save this data to online DB - delete business collaboration request'));
    }
  }

  addEditOnlineBusiness$(gateway: FsGateway, deleteOriginalGK: number, bl: FsBusinessList, originalEmail: string = ''): Observable<any> {
    const obs$: Observable<any>[] = [];
    try {
      const batch = writeBatch(this.fireStoreDB)

      // When accepting a share offer you have to change the doc id from your email to your userId and this can only be done by
      // creating a new similar doc and deleting the old. Rules ensure this only happens correctly
      // Doc id = email + bId if no user Id IE this agteway is an offer to share not yet accepted OR userId + bId for normal records

      if (gateway) {
        batch.set(doc(this.fireStoreDB, 'gateway', ((gateway.userId === '' || gateway.userId === 'x') ? gateway.email : gateway.userId) + gateway.bId), Object.assign({}, gateway));
      }

      if (bl) {
        batch.set(doc(this.fireStoreDB, 'organisations', bl.orgId, 'businessList', bl.bId), Object.assign({}, bl));
      }
      if (deleteOriginalGK === 2) {
        // delete before userId is added as replaced by the set above
        // CAUTION this record must be deleted AFTER the set above as it is checked for in the rules to allow similar to be made
        const gkDoc = doc(this.fireStoreDB, 'gateway', gateway.email + gateway.bId);
        batch.delete(gkDoc);
      } else if (deleteOriginalGK === 3) {
        // handing back
        const gkDoc = doc(this.fireStoreDB, 'gateway', this.stateService.userId + gateway.bId);
        batch.delete(gkDoc);
      } else if (deleteOriginalGK === 1) {
        // handing back
        const gkDoc = doc(this.fireStoreDB, 'gateway', originalEmail + gateway.bId);
        batch.delete(gkDoc);
      }

      return from(batch.commit()).pipe(
        map(() => {
          return;
        })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot add/update online Firestore business and gateway record'))
      );
      // .then(() => {
      //   return

      // }).catch(e => {
      //   this.fbOnlineCheckThrowLoggedError$(e, 'Cannot add/update online business and gateway record')
      // }));
    }
    catch (error: any) {
      return this.errorService.throwLoggedError$(this.errorService.processError(error, 'save this data to the online DB - add/update online business and gateway record'));
    }
  }

  addTestDoc$(): Observable<any> {
    const obj = { sts: serverTimestamp(), name: 'b' };
    return from(setDoc(doc(this.fireStoreDB, 'test', 'b'), obj))

      .pipe(first(), map(() => {
        // sts: serverTimestamp()
        // doc is void
        const t = 0;

      })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot write Firestore test')));


  }

  getTestDoc$(): Observable<any> {

    const docRef = doc(this.fireStoreDB, 'test', 'a');
    return from(getDocFromServer(docRef)).pipe(first(), map(doc => {
      // sts: serverTimestamp()
      // if (doc.docs.length > 0) {
      const x = doc;
      // }

    })
      , retry({ count: 2, delay: 2000 })
      , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get Firestore test')));

  }

  getTestDocQuery$(): Observable<any> {
    // return this.angularFfireStore.collection('test').doc('a').valueChanges()
    return from(getDocsFromServer(query(collection(this.fireStoreDB, 'test'), where('__name__', '==', 'a'))))

      .pipe(first(), map(doc => {
        // sts: serverTimestamp()
        if (doc.docs.length > 0) {
          const x = doc.docs[0].data();
        }

      })
        , retry({ count: 2, delay: 2000 })
        , catchError((e: any) => this.fbOnlineCheckThrowLoggedError$(e, 'Cannot get Firestore test2')));
  }


}
