import { Component } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor (public auth:AuthStore){
    
  }
}
