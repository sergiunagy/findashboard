import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DashboardConfig } from "../model/dashboardconfig";
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from "rxjs";
import { AuthStore } from "../auth/auth.store";
import * as moment from "moment";
import { environment } from '../../environments/environment';

const BACKEND_HOST = environment.backendurl; 
const NEW_DASHBOARD = environment.api_newdashboard;
const UPDATE_DASHBOARD = environment.api_updatedashboard;
const LOAD_LAST_DASHBOARD = environment.api_loadlastdashboard;
const FINDALL_DASHBOARDS = environment.api_findalldashboards ;
const DELETE_DASHBOARD =environment.api_deletedashboard;
const LOAD_DASHBOARD_BY_NAME_API = environment.api_loaddasboardbyname;

@Injectable({
  providedIn: 'root'
})
/**
 * State management service operations on dashboards configurations.
 */
export class DashboardsStore {

  private subjectDashboard = new BehaviorSubject(null);
  loadedDashboard$ = this.subjectDashboard.asObservable();

  /* state variable */
  private dashboardState: DashboardConfig = null;

  constructor(
    private http: HttpClient,
    private auth: AuthStore) {

    /* On store wake up: pull last loaded configuration for user. TODO: add auth validation*/
    const uid = auth.userState?.id
    if (!!uid) {
      this.loadLastSavedDasboardConfig(uid).pipe(
        tap(dashCfg => {
          this.dashboardState = dashCfg; /* store state */
          this.subjectDashboard.next(dashCfg); /* emit to subscribers */
        }
        )
      ).subscribe();
    } else {
      throw new Error("Store triggered without an authenticated User");
    }
  }

  /* ----------- READ ----------- */
  private loadLastSavedDasboardConfig(uid): Observable<DashboardConfig> {
    const url = BACKEND_HOST + LOAD_LAST_DASHBOARD;

    return this.http.get<Partial<DashboardConfig>>(url,
      {
        params: {
          user: uid,
        }
      }).pipe(
        map(response => {
          return <DashboardConfig>{
            id: response['dashboard']['_id'],
            name: response['dashboard']['name'],
            trackedSymbols: response['dashboard']['trackedSymbols'],
            unixTimestamp: response['dashboard']['unixTimestamp'],
          };
        }),
        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + url;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

  loadDashboardByOwnerAndName(userid: string, dashboard_name: string): Observable<DashboardConfig> {
    const url = BACKEND_HOST + LOAD_DASHBOARD_BY_NAME_API;

    return this.http.get<Partial<DashboardConfig>>(url,
      {
        params: {
          user: userid,
          dashboard_name: dashboard_name,
        }
      }).pipe(
        map(response => {
          return <DashboardConfig>{
            id: response['dashboard']['_id'],
            name: response['dashboard']['name'],
            trackedSymbols: response['dashboard']['trackedSymbols'],
            unixTimestamp: response['dashboard']['unixTimestamp'],
          };
        }),
        tap(dashCfg => {
          this.dashboardState = dashCfg; /* store state */
          this.subjectDashboard.next(dashCfg); /* emit to subscribers */
        }),
        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + url;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

  findAllDashboardNamesForUser(uid: string): Observable<string[]> {
    const url = BACKEND_HOST + FINDALL_DASHBOARDS;

    return this.http.get<DashboardConfig[]>(url,
      {
        params: {
          user: uid,
        }
      }).pipe(
        map(dashCfgs => {
          return dashCfgs.map(cfg => cfg.name);
        }),
        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + url;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

  /* ----------- CREATE AND UPDATE ----------- */
  createNewDashboard() {
    /* clear current configuration */
    const empytDashboard: DashboardConfig = {
      id: null,
      ownerid:"",
      name: "",
      trackedSymbols: [],
      unixTimestamp: null,
    };
    this.dashboardState = empytDashboard;
    this.subjectDashboard.next(empytDashboard);
  }

  abortCreateDashboard() {
    const uid = this.auth.userState?.id

    this.loadLastSavedDasboardConfig(uid).pipe(
      tap(dashCfg => {
        this.dashboardState = dashCfg; /* store state */
        this.subjectDashboard.next(dashCfg); /* emit to subscribers */
      })
    ).subscribe();
  }

  newDashboardsConfiguration(userid: string, dconfig: Partial<DashboardConfig>): Observable<boolean | Object> {

    const url = BACKEND_HOST + NEW_DASHBOARD;
    const uid = this.auth.userState?.id

    return this.http
      .post(url, dconfig,
        {
          params: {
            user: uid
          }
        })
      .pipe(
        catchError(err => {
          const msg = 'Failed to save dashboard';
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      )
  }

  addNewTrackedSym(symbol: string) {
    /* update local state */
    this.dashboardState.trackedSymbols.push(symbol);
    /* emit change to subscribers*/
    this.subjectDashboard.next(this.dashboardState);
  }

  removeTrackedSym(symbol: string) {
    /* update local state */
    const idx = this.dashboardState.trackedSymbols.indexOf(symbol);
    if (idx !== -1) {
      this.dashboardState.trackedSymbols.splice(idx, 1);
    }
    /* emit change to subscribers*/
    this.subjectDashboard.next(this.dashboardState);
  }

  saveEditedDashboard() {
    const url = BACKEND_HOST + UPDATE_DASHBOARD;
    const uid = this.auth.userState?.id;
    /* TODO: do some checks here: content, validation.. */

    /* construct our cfg */
    const dashCfg: Partial<DashboardConfig> = {
        /* id is not part of the editable section */
        name: this.dashboardState.trackedSymbols.join('-'),
        trackedSymbols: this.dashboardState.trackedSymbols,
        unixTimestamp: moment().unix()
    }

    /* push local state to storage */
    return this.http
      .put(url, dashCfg,
        {
          params: {
            user_id: this.auth.userState.id,
            dashboard_id: this.dashboardState.id,
          }
        })
      .pipe(
        catchError(err => {
          const msg = 'Failed to save dashboard';
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      )
    /* download latest, i.e. load what we just uploaded */
  }

  saveCreatedDashboard() {
    const url = BACKEND_HOST + NEW_DASHBOARD;
    const uid = this.auth.userState?.id;
    /* TODO: do some checks here: content, validation.. */

    /* construct our cfg */
    const dashCfg: Partial<DashboardConfig> = {
        /* id is generated */
        name: this.dashboardState.trackedSymbols.join('-'),
        trackedSymbols: this.dashboardState.trackedSymbols,
        unixTimestamp: moment().unix()
    }

    /* push local state to storage */
    return this.http
      .post(url, dashCfg,
        {
          params: {
            user: uid
          }
        })
      .pipe(
        catchError(err => {
          const msg = 'Failed to save dashboard';
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      )
    /* download latest, i.e. load what we just uploaded */
  }
  
  symbolIsTracked(symbol:string):boolean{
    return this.dashboardState.trackedSymbols.includes(symbol);
  }

  getNumberOfTrackedSymbols(){

    return this.dashboardState.trackedSymbols.length;
  }
  /* ----------- DELETE ----------- */

  deleteDashboard(dashid: number): Observable<boolean | Object> {
    const url = BACKEND_HOST + DELETE_DASHBOARD;
    const uid = this.auth.userState?.id
    return this.http.delete(url,
      {
        params: {
          dashboard_id: dashid
        }
      }).pipe(
        /* as a side-effect, load the last saved config into the current dashboard since our state is now invalid*/
        tap(_ => this.loadLastSavedDasboardConfig(uid).pipe(
          tap(dashCfg => this.subjectDashboard.next(dashCfg))
        ).subscribe()),
        catchError(err => {
          const msg = 'Delete dashboard failed for id' + dashid;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }
}