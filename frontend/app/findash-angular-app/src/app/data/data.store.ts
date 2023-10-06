
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthStore } from "../auth/auth.store";
import { BehaviorSubject, Observable, Subscription, catchError, interval, map, throwError } from "rxjs";
import { FinData } from "../model/findata";

const BACKEND_HOST="http://localhost:8080";
const CANDLE_DATA_API = "/findata/api/v1/stock/candle"

@Injectable({
    providedIn:"root" /* Make available to all components. */
})
export class DataStore{

    private timers: {[sym: string]: {polling:Subscription}}={};
    private trackers: {[sym: string]:{
                                    sData:BehaviorSubject<FinData[]>,
                                    data$: Observable<FinData[]>} } ={};

    constructor (private http: HttpClient,
                private auth: AuthStore,
                    ){}

                    
    registerNewTrackedSym(sym:string, update_interval_mins:number ){
        console.log("REGISTER: " + sym);
        /* check if symbol exists. Else throw error */
        /* create the data tracker -subject-obervable */
        this.trackers[sym]={
            sData: new BehaviorSubject<FinData[]>(null),
            data$: null,
        }
        this.trackers[sym].data$ = this.trackers[sym].sData.asObservable();
        /* initial load */
        this.getDataForSymbol(sym).subscribe(
            data=>this.trackers[sym].sData.next(data))
       
        /* create timer with a start event */
        this.timers[sym] = {
            polling: this.startTracking(update_interval_mins).subscribe(
               _=> { /* set up polling */
                this.getDataForSymbol(sym).subscribe(
                    data=>this.trackers[sym].sData.next(data))
               })   
        }

        return this.trackers[sym].data$;
        /* create a data-polling subject-observable pair triggered on timer event  */
    }

    unregisterTrackedSym(sym:string){}
    updateTrackedSymInterval(sym:string, new_update_interval_mins:number){}

    private  startTracking(update_interval_mins): Observable<number> {
        /* Set up a polling interval.
        Note:
        This is configured as a function of the data sampling, i.e. if data can only be sampled with a 
        1 minute period it makes no sense to poll more often than that since the data won't change.
        */
        /* min * s/min * ms/s = ms */
        return interval(update_interval_mins * 20*1000);      /* TEST: use 20s for testing the polling */
      }
 
      
      private getDataForSymbol(symbol: string){

        const LAST_24H = Math.round((new Date().getTime() - (24 * 60 * 60 * 1000))/1000);
        const epochUnixTimestampInSeconds = Math.round(new Date().getTime()/1000);
        
        const url = BACKEND_HOST + CANDLE_DATA_API;
        console.log("DATA UPDATE : "+ symbol+" :: "+ LAST_24H + "---" + epochUnixTimestampInSeconds );
        return this.http.get(url, {
            params: {
              symbol: symbol,
              resolution: "1",
              from: LAST_24H, //1694423228
              to: epochUnixTimestampInSeconds, //1694509628
              token: this.auth.userState.apikey,
              exchange: "LSE",
            },
            responseType: "json",
          }).pipe(
              /* First build an array of values of interest*/
              map(response => 
              {

                /* TODO: This can happen, ex: over the weekend. We need handling in this case, keep old data until new data is OK */
                if(response["s"]==="no_data"){
                  throw "no_data";
                }
                
                /* The 't' key contains our timestamp, 'c' contains the closure value over the resolution interval */
                return response['t'].map(
                (timestamp, idx)=>
                {
                  return {'date': new Date(timestamp*1000), 'value': response['c'][idx]};
                });
              }),
              catchError(err => {
                const msg = (err !="no_data") ? 'data collect failed to fetch data from provider':"no data for time interval";
                console.log(msg, err); /* dev log */
                return throwError(() => new Error(err));
              }),
      
          )
        } /*: Observable<FinData> */
}