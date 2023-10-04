import { Component } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

@Component({
  selector: 'app-dashboards-list',
  templateUrl: './dashboards-list.component.html',
  styleUrls: ['./dashboards-list.component.css']
})
export class DashboardsListComponent {

  constructor (public auth: AuthStore){

  }
}
