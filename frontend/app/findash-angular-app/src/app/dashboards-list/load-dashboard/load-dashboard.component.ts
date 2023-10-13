import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DashboardsStore } from '../dahsboards.store';
import { AuthStore } from 'src/app/auth/auth.store';
import { Observable, map } from 'rxjs';
import { DashboardConfig } from 'src/app/model/dashboardconfig';

class UserDashboardCfg {
  dashboardId: number;
  dashboardName: string;
}

@Component({
  selector: 'app-load-dashboard',
  templateUrl: './load-dashboard.component.html',
  styleUrls: ['./load-dashboard.component.css']
})
export class LoadDashboardComponent implements AfterViewInit{
  @ViewChild('dashnameinput') dashboardNameInput: ElementRef;
  @Output() close = new EventEmitter<void>();

  userDashboards$ : Observable<UserDashboardCfg[]>;

  constructor(
              private dashStore: DashboardsStore,
              private auth: AuthStore,
            ) 
    { 
      const uid = this.auth.userState?.id;
      this.userDashboards$ = dashStore.findAllDashboardsForUser(uid).pipe(
        map(dashboards => 
          {
          return dashboards.map(
              dashboard=>{
                  const cfg = new UserDashboardCfg();
                  Object.assign(cfg,{dashboardId:dashboard.id, dashboardName: dashboard.name});
                  return cfg;
          })
        })
      );
    } 
  
 
  ngAfterViewInit() { /* get focus AFTER View has finished init phase */
      this.dashboardNameInput.nativeElement.focus();
  } 
  
  onCancel(){
    this.close.emit();
  }
  
  onSubmit() { 
    const uid = this.auth.userState?.id;
    
    const name = this.dashboardNameInput.nativeElement.value;
    this.dashStore.loadDashboard(1).subscribe();
    this.close.emit();
  } 
  onListSubmit(dashboardId: number) { 
    const uid = this.auth.userState?.id;
    
    this.dashStore.loadDashboard(dashboardId).subscribe();
    this.close.emit();
  } 
}
