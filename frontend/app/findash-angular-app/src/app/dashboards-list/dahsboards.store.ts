import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DashboardConfig } from "../model/dashboardconfig";
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from "rxjs";
import { AuthStore } from "../auth/auth.store";

const BACKEND_HOST="http://localhost:8080";
const SAVE_DASHBOARD_API = "/api/v1/dashboards/save";
const LOAD_LAST_DASHBOARD = "/api/v1/dashboards/loadlast";
const LOAD_DASHBOARD_BY_NAME_API = "/api/v1/dashboards/load";

@Injectable({
    providedIn: 'root'
  })
  /**
   * State management service operations on dashboards configurations.
   */
  export class DashboardsStore {

    private subjectDashboard = new BehaviorSubject(null);
    loadedDashboard$ = this.subjectDashboard.asObservable();

    constructor(
        private http: HttpClient,
        private auth: AuthStore){

          /* On store wake up: pull last loaded configuration for user. TODO: add auth validation*/
          const uid = auth.userState?.id
          if(!!uid){
            this.loadLastSavedDasboardConfig(uid).pipe(
              tap(dashCfg=>this.subjectDashboard.next(dashCfg))
            ).subscribe();
          }
        }
    
   private loadLastSavedDasboardConfig(uid):Observable<DashboardConfig>{
      const url = BACKEND_HOST + LOAD_LAST_DASHBOARD;

      return this.http.get<Partial<DashboardConfig>>(url,
        {
          params:{
            user: uid,
          }
        }).pipe(
          map(response => {
              return <DashboardConfig>{
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

    saveDashboardsConfiguration(userid:string, dconfig: DashboardConfig):Observable<boolean | Object>{

        const url = BACKEND_HOST + SAVE_DASHBOARD_API;

        return this.http
            .post(url, dconfig,
                    {
                        params:{
                            user: "01865b6c51f04ba8a8b5ecc699fc51ec",
                    }})
            .pipe(
                catchError(err => {
                    const msg = 'Failed to save dashboard';
                    console.log(msg, err); /* dev log */
                    return throwError(() => new Error(err));
                })
              )
    }

    loadDashboardByOwnerAndName(userid:string, dashboard_name: string):Observable<DashboardConfig>{
        const url = BACKEND_HOST+LOAD_DASHBOARD_BY_NAME_API;

        return this.http.get<Partial<DashboardConfig>>(url,
          {
            params:{
              user: userid,
              dashboard_name: dashboard_name,
            }
          }).pipe(
            map(response => {
                return <DashboardConfig>{
                        name: response['dashboard']['name'],
                        trackedSymbols: response['dashboard']['trackedSymbols'],
                        unixTimestamp: response['dashboard']['unixTimestamp'],
                    };
            }),
            tap(dashCfg => this.subjectDashboard.next(dashCfg)),
            catchError(err => {
              const msg = 'Init Failed to fetch data from provider at' + url;
              console.log(msg, err); /* dev log */
              return throwError(() => new Error(err));
            })
          );
      }

  }