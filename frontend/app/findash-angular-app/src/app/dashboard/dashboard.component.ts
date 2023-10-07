import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FinData } from '../model/findata';
import { Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { DataStore } from '../data/data.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  symbolTracker$: Observable<FinData[]>;

  @Input() trackedSymbol: string = null;


  constructor( 
    private dataprovider: DataStore) { }


  ngOnInit(): void {

    if (!this.trackedSymbol) {
      throw new Error("Loaded dashboard with NULL data tracker");
    }

    this.symbolTracker$ = this.dataprovider.registerNewTrackedSym(this.trackedSymbol, 1/*minute*/ ).pipe(shareReplay());
  }

  ngOnDestroy(): void {
    /* Manual cleanup for symbol trackers */
    this.dataprovider.unregisterTrackedSym(this.trackedSymbol);
  }

}
