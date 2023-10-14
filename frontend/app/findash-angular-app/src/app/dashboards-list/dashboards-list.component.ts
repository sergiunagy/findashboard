import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { DashboardConfig } from '../model/dashboardconfig';
import * as moment from 'moment';
import { DashboardsStore } from './dahsboards.store';
import { Router } from '@angular/router';
import { DataStore } from '../data/data.store';
import { MessagesService } from '../messages/messages.service';
import { Subscription } from 'rxjs';

export enum DashboardStates {
  INIT,
  READ,
  EDIT,
  CREATE
}

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.css']
})
export class DashboardsListComponent implements OnInit, OnDestroy {
  private MAX_ALLOWED_DASH_ELEMENTS = 4;

  availableStates = DashboardStates;
  availableSymbols: string[] = [];
  /* Load configuration modal active flag */
  isLoadCfgOpen: boolean = false;
  /* state variable of the Dashboards  */
  currentState: DashboardStates;
  /* check against max */
  allowNewElement: boolean = false;
  /* state during adding a new tracker*/
  isAddingNewSymbol: boolean = false;
  /* Subscriptions to manage */
  subSymbols: Subscription;

  constructor(
    public auth: AuthStore,             /* user should be authenticated and a profile available */
    public dashStore: DashboardsStore, /* when this gets injected, the last configuration will be pre-loaded */
    public dataStore: DataStore,
    private msg: MessagesService,
    private router: Router,

  ) {

    /* Dev error : if this is reached the auth guard got bypassed */
    this.authValidCheck();
    this.currentState = DashboardStates.INIT;
    this.allowNewElement = false;
    /* subscribe to symbols list -> for quick search. TODO: maybe outsource to service ? */
    this.subSymbols = dataStore.availableSymbols$
      .subscribe(syms => this.availableSymbols = syms);
  }
  /* ---------- Lifecycle hooks ---------- */
  ngOnInit() {
    this.onTranToRead();
  }

  ngOnDestroy() {
    /* Manual subscriptions handling */
    this.subSymbols.unsubscribe();
  }
  /* ---------- State transitions ---------- */
  private onTranToEdit(){

    /* check and disable add button  */
    this.allowNewElement = this.dashStore.getNumberOfTrackedSymbols() < this.MAX_ALLOWED_DASH_ELEMENTS;
  }
 
  /**
   * Actions when transitioning to state (from other or same state)
   */
  private onTranToCreate(){
    this.onClear();
    /* check and disable add button  */
    this.allowNewElement = this.dashStore.getNumberOfTrackedSymbols() < this.MAX_ALLOWED_DASH_ELEMENTS;
    this.currentState = DashboardStates.CREATE;
  }
  private onTranToRead(){

    this.currentState = DashboardStates.READ;
  }

  /* ----------------  Create -----------------*/
  onNewDashboardsConfig() {
    /* state transition to activate template elements */
    this.onTranToCreate();
  }

  onCancelCreate() {
    /* inform store of rollback action */
    this.dashStore.abortCreateDashboard();
    /* state transition to READ */
    this.onTranToRead();
  }

  /**
   * Notification indicating the Symbol adding input is active
   */
  onAddNewSymbolToTrack() {
    this.isAddingNewSymbol = true;
  }

  onNewTrackedSymbolInput() {
    /* todo: Quicksearch here */
  }

  /**
   * Symbol adding input value submission.
   * Validate submission and trigger actions
   * @param event 
   * @returns 
   */
  onNewSymbolSubmit(event: any) {
    const symbol = event.target.value;
    /* validate against cached symbols*/
    if (!this.availableSymbols.includes(symbol)) {
      this.msg.showErrors('Symbol does not exist.');
      /*clear ? */
      return;
    }

    if (this.dashStore.symbolIsTracked(symbol)) {
      this.msg.showErrors('Symbol is already tracked.');
      return;
    }

    /* add symbol to be tracked */
    this.dashStore.addNewTrackedSym(symbol);
    /* check and disable add button  */
    this.allowNewElement = this.dashStore.getNumberOfTrackedSymbols() < this.MAX_ALLOWED_DASH_ELEMENTS;
    this.isAddingNewSymbol = false;
  }

  onSave() {

    if (this.currentState === DashboardStates.CREATE) {
      this.dashStore.saveCreatedDashboard().subscribe(
        res => console.log(res)
      );
    } else if (this.currentState === DashboardStates.EDIT){
      this.dashStore.saveEditedDashboard().subscribe(
        res => console.log(res)
      );      
    } else {/* catch all. This should not be reached */}
    /* state transition to READ */
    this.currentState = DashboardStates.READ;
    this.isAddingNewSymbol = false;
  }

  onRemoveDashboard(symbol:string){
    this.dashStore.removeTrackedSym(symbol);
    /* check and disable add button  */
    this.allowNewElement = this.dashStore.getNumberOfTrackedSymbols() < this.MAX_ALLOWED_DASH_ELEMENTS;
  }
  /* --------- Load  ----------
  * Configuration Modal handlers 
   */
  onDashboardsConfigLoad() {
    this.isLoadCfgOpen = true;
  }

  onHandleLoadModalClose() {
    this.isLoadCfgOpen = false;
  }

  /* ---------- Save  ---------- */

  /* ---------- Delete  ---------- */
  onDashboardDelete(dashboardId: number) {
    this.dashStore.deleteDashboard(dashboardId).subscribe();
  }
  /* ---------- Edit  ---------- */
  onEnterEditMode() {

    /* state transition to EDIT */
    this.currentState = DashboardStates.EDIT;
    this.allowNewElement = this.dashStore.getNumberOfTrackedSymbols() < this.MAX_ALLOWED_DASH_ELEMENTS;
    }
   /* ---------- Clear  ---------- */
   onClear() {
    /* Inform store to clear the dahsboard content */
    this.dashStore.createNewDashboard();
    /* state reset */
    this.isAddingNewSymbol = false;
    /* allow add */
    this.allowNewElement = true;
  }
  /* ------------ Private, utility methods ----------- */
  private authValidCheck() {
    if (!this.auth.userState) {
      throw new Error("Protected component called without auth");
    }
  }


}
