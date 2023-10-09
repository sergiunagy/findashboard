import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardsListComponent} from './dashboards-list/dashboards-list.component'
import {SigninComponent} from './signin/signin.component'
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: 'dashboards',
    component: DashboardsListComponent,
    canActivate:[AuthGuard],
  },
  {
    path: 'signin',
    component: SigninComponent,
  },
  {
    path: '**',
    redirectTo: 'signin'
  } 
]; 

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
