import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DashboardConfig } from "../model/dashboardconfig";
import { BehaviorSubject, Observable, catchError, map, reduce, tap, throwError } from "rxjs";
import { AuthStore } from "../auth/auth.store";
import * as moment from "moment";
import { environment } from '../../environments/environment';

const BACKEND_HOST = environment.backendurl; 
const DASHBOARDS_API = BACKEND_HOST + environment.api_dashboards;
const DASHBOARDS_LOOKUP_API = BACKEND_HOST + environment.api_find_by;

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

  /**
   * Executes Store component pre-loading and auth verification
   * @param http : service for http requests handling
   * @param auth : service for security ops
   */
  constructor(
    private http: HttpClient,
    private auth: AuthStore) {

    /* On store wake up: pull last loaded configuration for user. TODO: add auth validation*/
    const uid = auth.userState?.id
    if (!!uid) {
      this.loadLastSavedDasboardConfig(uid).pipe(
        tap(dashCfg => {
          console.log("LOADED:", JSON.stringify(dashCfg));
          this.dashboardState = dashCfg; /* store state */
          this.subjectDashboard.next(dashCfg); /* emit to subscribers */
        }
        )
      ).subscribe();
    } else {
      throw new Error("Store triggered without an authenticated User");
    }
  }

  /**
   * Defines the empty DashboardConfig object and returns it
   * @returns DashboardConfig
   */
  private getEmptyDashboard(): DashboardConfig{

    return {
      id: null,
      ownerid:"",
      name: "",
      trackedSymbols: [],
      unixTimestamp: null,
    };
  }

  /* ----------- READ ----------- */
  /**
   * Query the backend for the users stored configurations
   * and will select the latest configuration to return.
   * @param uid : user id
   * @returns Observable with the last stored dashboard config.
   */
  private loadLastSavedDasboardConfig(uid): Observable<DashboardConfig> {

    return this.http.get<DashboardConfig[]>(DASHBOARDS_API,
      {
        params: {
          ownerid: uid,
        }
      }).pipe(
        reduce((max, current) =>{
          /* Get the latest i.e. largest timestamp */
          current.forEach(el=> max= el.unixTimestamp > max.unixTimestamp ? el: max);
          return max;
        }, this.getEmptyDashboard()),

        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + DASHBOARDS_API;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

    /**
   * Query the backend for a dashboard identified by its id
   * @param uid : user id
   * @returns Observable with the found dashboard config.
   */
  loadDashboard(dashboardId: number): Observable<DashboardConfig> {

    return this.http.get<Partial<DashboardConfig>>(DASHBOARDS_LOOKUP_API,
      {
        params: {
          dashboardId,
        }
      }).pipe(
        map(response => {
          const dashboard = this.getEmptyDashboard();
          Object.assign(dashboard, response)
          return dashboard;          
        }),
        tap(dashCfg => {
          this.dashboardState = dashCfg; /* store state */
          this.subjectDashboard.next(dashCfg); /* emit to subscribers */
        }),
        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + DASHBOARDS_API;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

  /**
   * Query the backend for a list of dashboards owned by an user
   * @param uid : user id
   * @returns Observable with the found dashboard config.
   */
  findAllDashboardsForUser(uid: string): Observable<DashboardConfig[]> {

    return this.http.get<DashboardConfig[]>(DASHBOARDS_API,
      {
        params: {
          ownerid: uid,
        }
      }).pipe(
        catchError(err => {
          const msg = 'Init Failed to fetch data from provider at' + DASHBOARDS_API;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }

  /* ----------- CREATE AND UPDATE ----------- */
  createNewDashboard() {
    const ed = this.getEmptyDashboard();
    /* clear current configuration */
    this.dashboardState = ed;
    this.subjectDashboard.next(ed);
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
    /* TODO: do some checks here: content, validation.. */

    /* construct our cfg */
    const dashCfg: Partial<DashboardConfig> = this.getEmptyDashboard();
    /* load current state */
    Object.assign(dashCfg, this.dashboardState);
    /* update change sensitive properties */
    Object.assign(dashCfg, {
      /* re-calculate name */
      name: this.dashboardState.trackedSymbols.join('-'),
      /* update timestamp */
      unixTimestamp: moment().unix(),
  })
    
    /* push local state to storage */
    return this.http
      .put(DASHBOARDS_API, dashCfg)
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
    const ownerId = this.auth.userState?.id;
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
      .post(DASHBOARDS_API, dashCfg,
        {
          params: { ownerId}
        })
      .pipe(
        tap(newdashb => {
          const dashboard = this.getEmptyDashboard();
          Object.assign(dashboard, newdashb);
          this.dashboardState = dashboard; /* store state */
          this.subjectDashboard.next(dashboard); /* emit to subscribers */
        }),
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
  deleteDashboard(dashboardId: number): Observable<boolean | Object> {
    const uid = this.auth.userState?.id
    return this.http.delete(DASHBOARDS_API,
      {
        params: { dashboardId }
      }).pipe(
        /* as a side-effect, load the last saved config into the current dashboard since our state is now invalid*/
        tap(_ => this.loadLastSavedDasboardConfig(uid).pipe(
          tap(dashCfg => this.subjectDashboard.next(dashCfg))
        ).subscribe()),
        catchError(err => {
          const msg = 'Delete dashboard failed for id' + dashboardId;
          console.log(msg, err); /* dev log */
          return throwError(() => new Error(err));
        })
      );
  }
}