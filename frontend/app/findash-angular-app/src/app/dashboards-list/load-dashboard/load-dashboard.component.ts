import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DashboardsStore } from '../dahsboards.store';
import { AuthStore } from 'src/app/auth/auth.store';
import { Observable } from 'rxjs';
import { DashboardConfig } from 'src/app/model/dashboardconfig';

@Component({
  selector: 'app-load-dashboard',
  templateUrl: './load-dashboard.component.html',
  styleUrls: ['./load-dashboard.component.css']
})
export class LoadDashboardComponent implements AfterViewInit{
  @ViewChild('dashnameinput') dashboardNameInput: ElementRef;
  @Output() close = new EventEmitter<void>();

  userDashboards$ : Observable<string[]>;

  constructor(
              private dashStore: DashboardsStore,
              private auth: AuthStore,
            ) 
    { 
      const uid = this.auth.userState?.id;
      this.userDashboards$ = dashStore.findAllDashboardNamesForUser(uid);
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
    this.dashStore.loadDashboardByOwnerAndName(uid, name).subscribe();
    this.close.emit();
  } 
  onListSubmit(dname: string) { 
    const uid = this.auth.userState?.id;
    
    this.dashStore.loadDashboardByOwnerAndName(uid, dname).subscribe();
    this.close.emit();
  } 
}
