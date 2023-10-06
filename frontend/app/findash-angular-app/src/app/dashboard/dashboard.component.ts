import { Component, Input, OnInit, Output } from '@angular/core';
import { FinData } from '../model/findata';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';
import { DataStore } from '../data/data.store';

const BACKEND_HOST = "http://localhost:8080";
const CANDLE_DATA_API = "/findata/api/v1/stock/candle"

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  data$: Observable<FinData[]>;

  mySymTracker$: Observable<FinData[]>;

  @Input() trackedSymbol: string = null;


  constructor(private http: HttpClient,
    private auth: AuthStore,
    private dataprovider: DataStore) { }

  ngOnInit(): void {

    if (!this.trackedSymbol) {
      throw new Error("Loaded dashboard with NULL data tracker");
    }

    this.mySymTracker$ = this.dataprovider.registerNewTrackedSym(this.trackedSymbol, 1/*minute*/ );
  }

  private unregisterTrackedSymbol() { }

}
