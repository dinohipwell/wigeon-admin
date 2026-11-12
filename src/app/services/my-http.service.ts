import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvConfigService } from './env-config.service';

// import { TokenResponse } from './auth.service';
// import { TokenResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class MyHttpService {
  private http = inject(HttpClient);
  private envConfigService = inject(EnvConfigService);

  // wrapper class

  public authAccessToken = '';
  public refreshToken = '';

  getGoogleStorageJson<T>(url: string): Observable<T> {

    const optsx = new MyStorageJsonRequestOptions();
    return (
      this.http
        .get<HttpResponse<T>>(url, optsx as {})
        .pipe(
          map(res => {
            return res.body;
          })
        )
    );
  }

  // getAmpersandXml<T>(url: string): Observable<T> {
  //   // timestamp these requests to invalidate caches // done in interceptor + '?t=' + new Date().getTime();
  //   const optsx = new MyXmlRequestOptions(); // special xml header and response type
  //   // https://ampersandbrew.co/sitemap.xml
  //   const uri = 'https://ampersandbrew.co' + url;
  //   return (
  //     this.http
  //       .get<HttpResponse<T>>(uri, optsx as {})
  //       .pipe(
  //         map(res => {
  //           // this.checkHeaders(res.headers);
  //           return res.body;
  //         })
  //       )
  //   );
  // }

  getWebXmlxxx<T>(url: string): Observable<T> {
    // NOT DONE xxx timestamp these requests to invalidate caches // done in interceptor + '?t=' + new Date().getTime();
    const optsx = new MyXmlRequestOptions(); // special xml header and response type
    const uri = this.envConfigService.webUrl + url;
    return (
      this.http
        .get<HttpResponse<T>>(uri, optsx as {})
        .pipe(
          map(res => {
            return res.body;
          })
        )
    );
  }

  // doesn't work when online corrs????
  // getWebAlwaysOnline<T>(url: string): Observable<T> {
  //   // interceptor NOT DONE    timestamp these requests to invalidate caches // done in interceptor + '?t=' + new Date().getTime();
  //   if (this.envConfigService.envName === EnvName.Local) {
  //     // debug local version still look on line
  //     const uri = 'https://wigeon.app' + url + '?t=' + new Date().getTime();
  //     return this.http.get<T>(uri).pipe(
  //       map(res => {
  //         return res;
  //       })
  //     );
  //   } else {
  //     const uri = this.envConfigService.webUrl + url + '?t=' + new Date().getTime();
  //     return this.http.get<T>(uri).pipe(
  //       map(res => {
  //         return res;
  //       })
  //     );
  //   }
  // }

  getWeb<T>(url: string): Observable<T> {
    // interceptor NOT DONE    timestamp these requests to invalidate caches // done in interceptor + '?t=' + new Date().getTime();
    // if debug local version will look locally
    const uri = this.envConfigService.webUrl + url + '?t=' + new Date().getTime();
    return this.http.get<T>(uri).pipe(
      map(res => {
        return res;
      })
    );
  }

  getThirdParty<T>(url: string, opts = {}): Observable<T> {
    if ((opts as any).observe === 'response') {
      return (
        this.http
          .get<HttpResponse<T>>(url, opts)
          .pipe(
            map(res => {
              return res.body;
            })
          )
      );
    } else {
      return this.http.get<T>(url, opts);
    }
  }

  postThirdParty<T>(url: string, data: any, opts = {}): Observable<T> {
    if ((opts as any).observe === 'response') {
      return this.http.post<HttpResponse<T>>(url, data, opts).pipe(
        map((res: any) => {
          return res.body;
        })
      );
    } else {
      return this.http.post<T>(url, data, opts);
    }
  }

  getPostcodeCoordinates$(postcode: string): Observable<any> {

    return this.http.get<any>(`https://api.postcodes.io/postcodes/${postcode.replace(' ', '')}`, {}).pipe(map((res) => {
      return res.result;
    }));
  }

  //     async function getCoordsFromPostcode(postcode: string) {
  //   try {
  //     const response = await fetch(`https://api.postcodes.io/postcodes/${postcode.replace(' ', '')}`);
  //     const data = await response.json();

  //     if (data.status === 200) {
  //       const { latitude, longitude } = data.result;
  //       console.log(`Postcode: ${postcode}, Lat: ${latitude}, Long: ${longitude}`);
  //       return { latitude, longitude };
  //     } else {
  //       console.error("Postcode not found");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // }



  // getServer<T>(url: string, opts = {}): Observable<T> {
  //   const uri = this.envConfigService.apiUrl + url;

  //   if ((opts as any).observe === 'response') {
  //     return (
  //       this.http
  //         .get<HttpResponse<T>>(uri, opts)
  //         // .retryWhen(error => error.delay(1000))
  //         // .timeout(100000, new Error('delay exceeded'))
  //         .pipe(
  //           map(res => {
  //             // this.checkHeaders(res.headers);
  //             return res.body;
  //           })
  //         )
  //     );
  //   } else {
  //     return this.http.get<T>(uri, opts);
  //   }
  // }

  // postServer<T>(url: string, data: any, opts = {}): Observable<T> {
  //   const uri = this.envConfigService.apiUrl + url;

  //   if ((opts as any).observe === 'response') {
  //     return this.http.post<HttpResponse<T>>(uri, data, opts).pipe(
  //       map((res: any) => {
  //         // this.checkHeaders(res.headers);
  //         return res.body;
  //       })
  //     );
  //   } else {
  //     return this.http.post<T>(uri, data, opts);
  //   }
  // }

  // putServer<T>(url: string, data: any, opts = {}): Observable<T> {
  //   // this.configureAuth(opts);
  //   const uri = this.envConfigService.apiUrl + url;

  //   if ((opts as any).observe === 'response') {
  //     return this.http.put<HttpResponse<T>>(uri, data, opts).pipe(
  //       map((res: any) => {
  //         // this.checkHeaders(res.headers);
  //         return res.body;
  //       })
  //     );
  //   } else {
  //     return this.http.put<T>(uri, data, opts);
  //   }
  // }

  // deleteServer<T>(url: string, opts = {}): Observable<T> {
  //   const uri = this.envConfigService.apiUrl + url;

  //   if ((opts as any).observe === 'response') {
  //     return this.http.delete<HttpResponse<T>>(uri, opts).pipe(
  //       map(res => {
  //         // this.checkHeaders(res.headers);
  //         return res.body;
  //       })
  //     );
  //   } else {
  //     return this.http.delete<T>(uri);
  //   }
  // }

  // setAuth(auth: TokenResponse) {
  // if (auth) {
  //   this.authAccessToken = auth.token;
  //   this.refreshToken = auth.refreshToken;
  //   this.stateService.userName = auth.userName;
  //   this.stateService.userEmail = auth.userEmail;
  //   this.stateService.setAuthRole(auth.role, auth.uOpts);
  //   this.storeLocally(auth);
  //   const n = this.stateService.getUOpt(1001);
  //   if (n > 0) {
  //     document.body.setAttribute(
  //       'data-theme',
  //       n === 0 ? 'standard' : n === 1 ? 'strong' : 'bright'
  //     );
  //   }
  // } else {
  //   this.clearAuthStore();
  //   this.authAccessToken = '';
  //   this.refreshToken = '';
  //   this.stateService.userName = '';
  //   this.stateService.userEmail = '';
  //   // not needed in manager only in web this.stateService.userBizId = -1;
  //   // this.stateService.userBizTpe = 0;
  //   this.stateService.setAuthRole(0, null);
  // }
  //}

  // Retrieves the auth JSON object (or NULL if none)
  // getAuth(): any {
  // try {
  //   const i = localStorage.getItem('beerAuthKey');
  //   if (i) {
  //     return JSON.parse(i);
  //   } else {
  //     return null;
  //   }
  // } catch (e) {
  //   return null;
  // }
  //  }

  // storeLocally(auth: TokenResponse) {
  // try {
  //   localStorage.setItem('beerAuthKey', JSON.stringify(auth));
  // } catch (e) {
  //   // ignore
  // }
  // }

  // clearAuthStore(): any {
  // try {
  //   localStorage.removeItem('beerAuthKey');
  // } catch (e) {
  //   // ignore
  // }
  // }

}

export interface WebVersion {
  semver: string;
}

export enum EnvName {
  Local = 'local',
  PrPreview = 'pr-preview',
  Staging = 'staging',
  Live = 'live'
}

export class MyRequestOptions {
  public params: HttpParams;
  public headers: HttpHeaders;
  public observe = '';

  constructor() {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.observe = 'response';
  }
}

export class MyStorageJsonRequestOptions {

  //public headers: HttpHeaders;
  public observe = '';
  public responseType = '';

  constructor() {
    //this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.observe = 'response';
    this.responseType = 'json';

  }
}

export class MyBlobRequestOptions {
  public params: HttpParams;
  public headers: HttpHeaders;
  public observe = '';
  public responseType = '';

  constructor() {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.observe = 'response';
    this.responseType = 'blob';
    this.params = new HttpParams();
  }
}

export class MyXmlRequestOptions {
  public params: HttpParams;
  public headers: HttpHeaders;
  public observe = '';
  public responseType = '';

  constructor() {
    // this.headers = new HttpHeaders({ 'Content-Type': 'text/xml' });
    this.headers = new HttpHeaders()
      .set('Content-Type', 'text/xml')
      .append('Access-Control-Allow-Methods', 'GET')
      .append('Access-Control-Allow-Origin', '*')
      .append('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Access-Control-Request-Method");
    this.observe = 'response';
    this.responseType = 'text'; // this is needed
    this.params = new HttpParams();
  }
}
