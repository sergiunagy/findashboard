import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardsListComponent} from './dashboards-list/dashboards-list.component'
import {SigninComponent} from './signin/signin.component'
import {HomeComponent} from './home/home.component'

const routes: Routes = [
  {
    path: 'dashboards',
    component: DashboardsListComponent,
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
