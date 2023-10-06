import { Component, Input, OnInit, Output } from '@angular/core';
import { FinData } from '../model/findata';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { DataStore } from '../data/data.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  symbolTracker$: Observable<FinData[]>;

  @Input() trackedSymbol: string = null;


  constructor( 
    private dataprovider: DataStore) { }

  ngOnInit(): void {

    if (!this.trackedSymbol) {
      throw new Error("Loaded dashboard with NULL data tracker");
    }

    this.symbolTracker$ = this.dataprovider.registerNewTrackedSym(this.trackedSymbol, 1/*minute*/ );
  }

  private unregisterTrackedSymbol() { }

}
