import { Component, OnInit } from '@angular/core';
import { AuthStore } from '../auth/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit{

  constructor(
      private auth: AuthStore,
      private router: Router,)
      {}

  ngOnInit(): void {
    this.auth.signin().subscribe({
      next: () => this.router.navigateByUrl("/dashboards"),
      error: err => alert("Login failed!")
    });
  }

}
