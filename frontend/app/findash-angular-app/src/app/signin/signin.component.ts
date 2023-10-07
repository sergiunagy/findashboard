import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit, OnDestroy{

  private signInSub :Subscription;
  constructor(
      private auth: AuthStore,
      private router: Router,)
      {}


  ngOnInit(): void {
    this.signInSub=this.auth.signin().subscribe({
      next: () => this.router.navigateByUrl("/dashboards"),
      error: err => alert("Login failed!")
    });
  }

  ngOnDestroy(): void {
    this.signInSub.unsubscribe();
  }
}
