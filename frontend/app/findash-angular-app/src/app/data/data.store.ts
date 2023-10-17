
import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpParams, HttpRequest } from "@angular/common/http";
import { AuthStore } from "../auth/auth.store";
import { BehaviorSubject, Observable, Subscription, catchError, count, delay, delayWhen, interval, map, mergeMap, of, retry, retryWhen, share, shareReplay, tap, throwError, timer } from "rxjs";
import { FinData } from "../model/findata";
import { environment } from "src/environments/environment";

const BACKEND_HOST = environment.backendurl;
const CANDLE_DATA_API = environment.api_getcandle;
const FIND_SYMBOLS_API = environment.api_findsymbols;
const FORECAST_API = environment.api_forecast;

@Injectable({
  providedIn: "root" /* Make available to all components. */
})
export class DataStore {

  private timers: { [sym: string]: { polling: Subscription } } = {};
  private trackers: {
    [sym: string]: {
      sData: BehaviorSubject<FinData[]>,  /* finance data stream */
      data$: Observable<FinData[]>,
      sPred: BehaviorSubject<string>,  /* predictions data stream */
      pred$: Observable<string>
    }
  } = {};

  /* Data provider available Symbols list */
  private subjectSymbols = new BehaviorSubject(null);
  availableSymbols$ = this.subjectSymbols.asObservable();

  constructor(private http: HttpClient,
    private auth: AuthStore,
  ) {
    /* preload once at startup -> this takes signifficant time so it is preloading*/
    this.loadAllAvailableSymbols().subscribe(
      symbolsList => this.subjectSymbols.next(symbolsList)
    );
  }

  getPredictionsTrackerForSymbol(symbol): Observable<string>{

    return this.trackers[symbol].pred$;
  }

  registerNewTrackedSym(sym: string, update_interval_mins: number) {
    /* check if symbol exists. Else throw error */
    /* create the data tracker -subject-observable */
    this.trackers[sym] = {
      sData: new BehaviorSubject<FinData[]>(null),
      data$: null,
      sPred: new BehaviorSubject<string>(null),
      pred$: null,
    }
    this.trackers[sym].data$ = this.trackers[sym].sData.asObservable();
    this.trackers[sym].pred$ = this.trackers[sym].sPred.asObservable();
    /* initial load */
    this.getDataForSymbol(sym).subscribe(
      data => this.trackers[sym].sData.next(data))

    /* create timer to trigger data collection periodically for this sym */
    this.timers[sym] = {
      polling: this.startTracking(update_interval_mins).subscribe(
        _ => { /* set up polling */
          this.getDataForSymbol(sym).pipe(
            tap(_ =>{ 
              console.log('registering predictor for ', sym);
              this.requestPredictionsForSym(sym)
                  .subscribe(prediction => this.trackers[sym].sPred.next(prediction))}),
            shareReplay()
            ).subscribe(data => {
              this.trackers[sym].sData.next(data);
            });

        })
    }
    console.log('tracker add: ' + sym);
    return this.trackers[sym].data$;
  }

  unregisterTrackedSym(sym: string) {
    console.log('tracker delete: ' + sym);
    this.timers[sym].polling.unsubscribe();
    delete this.timers[sym];
  }

  updateTrackedSymInterval(sym: string, new_update_interval_mins: number) { }


  loadAllAvailableSymbols(): Observable<string[]> {
    const url = BACKEND_HOST + FIND_SYMBOLS_API;
    return this.http.get<any[]>(url, {
      params: {
        token: this.auth.userState.apikey,
        exchange: "US",
      },
      // responseType: "json",
    }).pipe(
      /* First build an array of values of interest*/
      map(data => data.map(el => el['symbol'])),
      catchError(err => {
        const msg = (err != "no_data") ? 'data collect failed to fetch data from provider' : "no data for time interval";
        console.log(msg, err); /* dev log */
        return throwError(() => new Error(err));
      }))
  } /*findAllSymbols*/


  private startTracking(update_interval_mins): Observable<number> {
    /* Set up a polling interval.
    Note:
    This is configured as a function of the data sampling, i.e. if data can only be sampled with a 
    1 minute period it makes no sense to poll more often than that since the data won't change.
    */
    /* min * s/min * ms/s = ms */
    return interval(update_interval_mins * 20 * 1000);      /* TEST: use 20s for testing the polling */
  }

  /* get a time interval from with a variable day-factor
   */
  private getPastTimestampFromNow(days: number = 1): number {
    /* current timestamp in seconds */
    const miliSecondsInPast = (24 /* h/d */ *
      60 /* m/h */ *
      60 /* s/m */ *
      1000 /* ms/s */ *
      days /* amount of days to consider */
    )
    /* past/older timestamp in seconds */
    const lowTimestampSeconds = Math.round((new Date().getTime() - miliSecondsInPast) / 1000);

    return lowTimestampSeconds
  }

  private getDataForSymbol(symbol: string, days:number=1, retry:number=0) {

    const url = BACKEND_HOST + CANDLE_DATA_API;
    /* limit the number of retries */
    if (retry > 2){
      return of(null);
    }

    const params = {
      symbol: symbol,
      resolution: "1",
      from: this.getPastTimestampFromNow(days), //1694423228
      to: Math.round(new Date().getTime() / 1000), //1694509628
      token: this.auth.userState.apikey,
      exchange: "LSE",
    };

    return this.http.get(url, { params: params }).pipe(
      /* First build an array of values of interest*/
      map(response => {
        /* TODO: This can happen, ex: over the weekend. Notify upstream */
        if (response["s"] === "no_data") {
          throw new Error("no_data");
        }
        /* The 't' key contains our timestamp, 'c' contains the closure value over the resolution interval */
        return response['t'].map(
          (timestamp, idx) => {
            return { 'date': new Date(timestamp * 1000), 'value': response['c'][idx] };
          });
      }),
       catchError(err => {
        /* for no data, try to extend period in the past */
        if (err.message ==="no_data"){
          delay(1000);
          retry++;
          days++;
          return this.getDataForSymbol(symbol, days, retry);
        }
        const msg = (err.message !== "no_data") ? 'data collect failed to fetch data from provider' : "no data for time interval";
        console.log(msg, err.message); /* dev log */
        return throwError(() => new Error(err));
      }),
    )
  } /*: Observable<FinData> */

  private requestPredictionsForSym(sym:string): Observable<string> {
    const url = BACKEND_HOST + FORECAST_API;
    return this.http.get<any[]>(url, {
      params: {
        symbol:sym,
        start_time: this.getPastTimestampFromNow(1),
        end_time: Math.round(new Date().getTime() / 1000),
      },
      responseType: "json",
    }).pipe(
      /* First build an array of values of interest*/
      map(data => data['prediction']),
      catchError(err => {
        const msg = (err != "no_data") ? 'data collect failed to fetch data from provider' : "no data for time interval";
        console.log(msg, err); /* dev log */
        return throwError(() => new Error(err));
      }))
  } /*requestPredictionsForSym*/

}