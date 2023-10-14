import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FinData } from '../model/findata';
import { Observable, catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { DataStore } from '../data/data.store';
import { DashboardsStore } from '../dashboards-list/dahsboards.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  symbolTracker$: Observable<FinData[]>;

  @Input() @Output() isEditable=false;

  @Input() trackedSymbol: string = null;

  @Output() removeRequested = new EventEmitter();

  constructor(private dataprovider: DataStore,
              private dashStore: DashboardsStore /* todo: this creates tight-coupling, refactor */
            ) { }


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

  onRemoveElement(){
    this.removeRequested.emit();
  }
}
