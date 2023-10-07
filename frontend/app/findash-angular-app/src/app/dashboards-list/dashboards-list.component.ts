import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { DashboardConfig } from '../model/dashboardconfig';
import * as moment from 'moment';
import { DashboardsStore } from './dahsboards.store';
import { Router } from '@angular/router';

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

  availableStates  = DashboardStates;
  /* Load configuration modal active flag */
  isLoadCfgOpen: boolean=false; 
  /* state variable of the Dashboards  */
  currentState : DashboardStates;

  constructor(
    public auth: AuthStore,             /* user should be authenticated and a profile available */
    public dashStore: DashboardsStore, /* when this gets injected, the last configuration will be pre-loaded */
    private router: Router
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
