import { Component, Input, OnInit, Output } from '@angular/core';
import { FinData } from '../model/findata';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';

const BACKEND_HOST="http://localhost:8080";
const CANDLE_DATA_API = "/findata/api/v1/stock/candle"

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  data$: Observable<FinData[]>;

  mySymTracker$: Observable<{date:string, value:number}[]>;

  @Input() trackedSymbol: string=null;

  constructor(private http: HttpClient,
              private auth: AuthStore){}

  ngOnInit(): void {

    if(!this.trackedSymbol){
      throw new Error("Loaded dashboard with NULL data tracker") ;
    }

    this.mySymTracker$ = this.registerNewTrackedSymbol(this.trackedSymbol);

  }

  private registerNewTrackedSymbol(symbol: string){

  const LAST_24H = Math.round((new Date().getTime() - (24 * 60 * 60 * 1000))/1000);
  const epochUnixTimestampInSeconds = Math.round(new Date().getTime()/1000);
  
  const url = BACKEND_HOST + CANDLE_DATA_API;

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
          if(response["s"]=="no_data"){
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
  private unregisterTrackedSymbol(){}

}
