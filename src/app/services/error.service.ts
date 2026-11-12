import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Message } from 'src/app/classes/misc/message';


@Injectable({
  providedIn: 'root'
})

export class ErrorService {
  public errorList: Message[] = null;
  public errorDataList: Message[] = null;
  public errorTileList: string[] = null;

  public tooManyTileRequestsError = false;
  private internalErrorListSubject = new BehaviorSubject<boolean>(null);

  constructor() {
    // caused a problem private service: DataService) {

  }

  get onErrorListChanged$() {
    // 0 = none changed else is number of data objects downloaded and used
    return this.internalErrorListSubject.asObservable();
  }

  addError(tpe: number, err: string) {
    // wm-alert-box-danger': n.tpe===0, 'wm-alert-box-warning': n.tpe===1,'wm-alert-box-info': n.tpe===2,'wm-alert-box-success': n.tpe===3
    if (!this.errorList) {
      this.errorList = [];
    }
    if (!this.errorList.some(s => s.tpe === tpe && s.text === err)) {
      this.errorList.push(new Message(tpe, err));
    }
    this.internalErrorListSubject.next(true);
  }

  clearErrors() {
    this.errorTileList = null;
    this.errorList = null;
    this.errorDataList = null;
    this.internalErrorListSubject.next(false);
    // throw new Error("Parameter is not a number!");

    // this.errorDataList = [new Message(1, 'Dummy error')];
    // this.errorList = [new Message(1, 'aaaaaDummy error')];
    // this.errorTileList = ['Dummy Tile error'];
  }

  public processMsgThrowHandledError$(msg: string): Observable<any> {
    // Use to make sure isProcessing flag in data.service is cleared ONLY
    // use inside a pipe to create a new handles error from code
    const x = this.processMessage(msg);
    return throwError(() => new HandledError(x));
  }

  public throwHandledError$(m: string): Observable<any> {
    // Use to make sure isPprocessing flag in data/service is cleared ONLY
    //
    // used to globally replace depreciated throw Error(message)
    // both the below work BUT () => needs an extra ) adding to the end of the line so could not be globally changed
    //
    // catchError((error: any) => this.errorService.throwHandledError(() => new Error(this.myHttp.handleError(error, 'get this data')))));
    // catchError((error: any) => this.errorService.throwHandledError(this.myHttp.handleError(error, 'get this data'))));

    return throwError(() => new HandledError(m));
  }

  public throwLoggedError$(m: string): Observable<any> {
    // used to globally replace depreciated throw Error(message)
    // both the below work BUT () => needs an extra ) adding to the end of the line so could not be globally changed
    //
    // catchError((error: any) => this.errorService.throwHandledError(() => new Error(this.myHttp.handleError(error, 'get this data')))));
    // catchError((error: any) => this.errorService.throwHandledError(this.myHttp.handleError(error, 'get this data'))));

    return throwError(() => new LoggedError(m));
  }



  public extractThrowError$(e: any, m: string): Observable<any> {
    // used to globally replace depreciated throw Error(message)

    m = this.extractErrorMessage(e, m);
    return throwError(() => new Error(m));
  }

  public extractErrorMessage(e: any, m: string): string {
    if (e) {
      if (typeof e === "string") {
        m += ' - ' + e;
      } else if (e instanceof Error) {
        m += ' - ' + e.message;
      } else {
        m += ' - Unknow error';
      }
    }
    console.log(m);
    return m;
  }

  public processErrorList(errList: Message[]) {
    if (errList && errList.length > 0) {
      // one or more errors
      if (this.errorList) {
        this.errorList = [...errList, ...this.errorList].slice(0, 5);
      } else {
        this.errorList = errList;
      }
      this.internalErrorListSubject.next(true);
    }
  }

  public processTileErrorList(errList: string[]) {
    if (errList && errList.length > 0) {
      // one or more errors
      if (this.errorTileList) {
        this.errorTileList = [...errList, ...this.errorTileList].slice(0, 5);
      } else {
        this.errorTileList = errList;
      }
      this.internalErrorListSubject.next(true);
    }
  }

  public processMessage(msg: string): string {
    try {

      const x = new Message(0, msg);

      // only add to list once even if thrown again....
      if (this.errorList) {
        this.errorList = [x, ...this.errorList].slice(0, 5);
      } else {
        this.errorList = [x];
      }
      this.internalErrorListSubject.next(true);
      return x.text;
    } catch {
      return 'Error';
    }
  }
  public processError(error: any, msg: string): string {
    try {

      const x = new Message(0, this.handleError(error, msg));
      if (!error || !((error instanceof HandledError) || (error instanceof LoggedError))) {
        // only add to list once even if thrown again....

        if (this.errorList) {
          this.errorList = [x, ...this.errorList].slice(0, 5);
        } else {
          this.errorList = [x];
        }
        this.internalErrorListSubject.next(true);
      }

      return x.text;
    } catch {
      return 'Error';
    }
  }

  public processDataError(error: any, msg: string): string {
    // must be called to clear process flag
    try {

      const x = new Message(0, this.handleError(error, msg));
      if (!error || !((error instanceof HandledError) || (error instanceof LoggedError))) {
        // only add to list once even if thrown again....
        // only set is processing false once

        if (this.errorDataList) {
          this.errorDataList = [x, ...this.errorDataList].slice(0, 5);
        } else {
          this.errorDataList = [x];
        }
        this.internalErrorListSubject.next(true);
      }

      return x.text;
    } catch {
      return 'Error';
    }
  }

  public processTileHttpError(error: HttpErrorResponse, msg: string): string {
    // must be called to clear process flag
    try {

      if (error.status && error.status === 429) {
        if (this.tooManyTileRequestsError) {
          return ''; // only report once so you can continue to use the cached ones
        } else {
          this.tooManyTileRequestsError = true;
        }
      }
      const x: string = this.handleError(error, msg);
      if (this.errorList) {
        if (this.errorTileList.findIndex(m => m === x) === -1) {
          // only add each message once
          this.errorTileList = [x, ...this.errorTileList].slice(0, 5); // limits to 5 max
        }
      } else {
        this.errorTileList = [x];
      }
      this.internalErrorListSubject.next(true);

      return x;
    } catch {
      return 'Error';
    }
  }

  public handleError(myError: HttpErrorResponse | any, m: string): string {
    let errMsg = `ERROR: Unable to ${m}`;
    try {
      if (!myError) {

      } else {
        errMsg += ' - ';
        //   if (error instanceof HttpErrorResponse) {
        if (myError.status === 0 && myError.error instanceof ProgressEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          errMsg = 'ERROR you appear to have lost your internet or network connection, please resolve and try again.';
        } else if (myError.status && myError.status === 502) {
          errMsg += ' server call timed out. ';
        } else if (myError.status && myError.status === 401) {
          errMsg += ' unauthorised please log in and try again. ';
        } else if (myError.status && myError.status === 429) {
          errMsg += ' too many requests for Google map data.';
        } else {
          // myError.error has the original e.Message put in by controller StatusCode(500, e);
          // passing in just a message lets StatusCode auto add path and parameters
          if (myError.error?.info) {
            // LogicException - Friendlier message no path shown as coded message so we could find in code
            errMsg += myError.error.info;
          } else if (myError.error && (typeof myError.error === 'string' || myError.error instanceof String)) {
            // Handled single level error
            errMsg += myError.error;
            if (myError.url) {
              errMsg += ' - At ' + myError.url;
            }
          } else if (myError.error && myError.error.Message) {
            // unhandled error back OR handled with an inner exception
            errMsg += myError.error.Message;
            if (myError.error.InnerMessage) {
              errMsg += ' - Inner info ' + myError.error.InnerMessage;
            }
            if (myError.message) {
              errMsg += ' - Message ' + myError.message;
            }
          } else if (myError.message) {
            // Failsafe
            errMsg += myError.message;
          } else {
            // Failsafe fro ngx-indezed-db
            errMsg += myError;
          }
        }
      }
      // status statusText has number and definition of number eg 500 Internal server error
    } catch {
    }
    return errMsg;
  }
}


export class HandledError extends Error {
  // Use to make sure isProcessing flag in data.service is cleared ONLY
  // and then makes sure is only logs the first error message in a chain
}

export class LoggedError extends Error {
  // Use in all other services to only logs the first error message in a chain
}




