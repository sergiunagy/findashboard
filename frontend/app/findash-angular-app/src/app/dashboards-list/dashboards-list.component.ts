import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { DashboardConfig } from '../model/dashboardconfig';
import * as moment from 'moment';
import { DashboardsStore } from './dahsboards.store';
import { Router } from '@angular/router';
import { DataStore } from '../data/data.store';
import { MessagesService } from '../messages/messages.service';

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
export class DashboardsListComponent implements OnInit, OnDestroy{
  private MAX_ELEMENTS = 4;

  availableStates  = DashboardStates;
  /* Load configuration modal active flag */
  isLoadCfgOpen: boolean=false; 
  /* state variable of the Dashboards  */
  currentState : DashboardStates;
  /* check against max */
  allowNewElement : boolean = false; 
   /* state during adding a new tracker*/
  isAddingNewSymbol: boolean = false;

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
  }
  /* ---------- Lifecycle hooks ---------- */
  ngOnInit(){
    this.currentState = DashboardStates.READ;
  }

  ngOnDestroy(){
    /* Manual subscriptions handling */
  }

  /* ----------------  Create -----------------*/
  onNewDashboardsConfig() {
    /* TEST - hardcoded data */
    const testDashboard: Partial<DashboardConfig> = {
      name: "NVDA-TSLA-META",
      trackedSymbols: ["NVDA", "TSLA", "META"],
      unixTimestamp: moment().unix()
    }
    /* TEST */
    /* state transition to activate template elements */
    this.currentState=DashboardStates.CREATE;

    // this.dashStore.newDashboardsConfiguration(uid, testDashboard).subscribe();
    this.dashStore.createNewDashboard();
  }

  onClear(){
    /* Inform store to clear the dahsboard content */
    this.dashStore.createNewDashboard();
    /* state reset */
    this.isAddingNewSymbol = false;
  }
  onCancelCreate(){
    /* inform store of rollback action */
    this.dashStore.abortCreateDashboard();
    /* state transition to READ */
    this.currentState = DashboardStates.READ;
    this.isAddingNewSymbol = false;

  }
  onAddNewSymbolToTrack(){
    this.isAddingNewSymbol = true;
  }

  onNewTrackedSymbolInput(){
    console.log("k");
  }
  onNewSymbolSubmit(){
    this.msg.showErrors('Yarrr');
    this.isAddingNewSymbol = false;
  }
 /* --------- Load  ----------
 * Configuration Modal handlers 
  */
  onDashboardsConfigLoad() {
    this.isLoadCfgOpen = true;
  }

  onHandleLoadModalClose(){
    this.isLoadCfgOpen=false;
  }

  /* ---------- Save  ---------- */
  onSaveDashboardsConfig() { }
  /* ---------- Delete  ---------- */
  onDashboardDelete(dashboardId:number){
    this.dashStore.deleteDashboard(dashboardId).subscribe();
  }
  /* ---------- Edit  ---------- */
  /* ---------- Clear  ---------- */

  /* ------------ Private, utility methods ----------- */
  private authValidCheck() {
    if (!this.auth.userState) {
      throw new Error("Protected component called without auth");
    }
  }


}
