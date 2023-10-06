import { Component, Output } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { DashboardConfig } from '../model/dashboardconfig';
import * as moment from 'moment';
import { DashboardsStore } from './dahsboards.store';



@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.css']
})
export class DashboardsListComponent {

  isLoadCfgOpen: boolean=false;

  constructor(
    public auth: AuthStore,
    public dashStore: DashboardsStore,
  ) {

    /* Dev error : if this is reached the auth guard got bypassed */
    this.authValidCheck();
  }

  onNewDashboardsConfig() {
    /* TEST */
    const testDashboard: DashboardConfig = {
      name: "NVDA-TSLA-META",
      trackedSymbols: ["NVDA", "TSLA", "META"],
      unixTimestamp: moment().unix()
    }
    /* TEST */
    const uid = this.auth.userState?.id;
    this.authValidCheck();

    this.dashStore.saveDashboardsConfiguration(uid, testDashboard).subscribe();
  }

  onDashboardsConfigLoad() {
    /* TEST */
    const uid = this.auth.userState?.id;
    const dashname = 'JPM-TSLA-NVDA';
    /* TEST */
    this.authValidCheck();
    this.isLoadCfgOpen = true;
  }

  onSaveDashboardsConfig() {

  }

  private authValidCheck() {
    if (!this.auth.userState) {
      throw new Error("Protected component called without auth");
    }
  }

  onHandleLoadModalClose(){
    this.isLoadCfgOpen=false;
  }
}
