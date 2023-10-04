import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BehaviorSubject, Observable, map, shareReplay, tap } from "rxjs";
import { User } from "../model/user";

const BACKEND_HOST="http://localhost:8080";
const SIGN_IN_API = "/api/v1/auth/signin";

@Injectable({
    providedIn: 'root'
})
export class AuthStore{
    /* Use the subject-observable pattern */
    private subjectUser = new BehaviorSubject<User>(null); /* Initial value: null, i.e. no auth data exists for the user */

    user$: Observable<User> = this.subjectUser.asObservable();  /* Provided user-auth data Observable. Bound to the private Subject */
    isAuthenticated$: Observable<boolean>;                      /* Provided user-auth flag Observable */

    constructor (private http: HttpClient){
        /* Derive auth data from the root subjectUser */
        this.isAuthenticated$ = this.user$.pipe(
            map(user => !!user), /* evaluate every emmitted value against null */
        )
    }

    /**
     * Performs authentication on backend. Stores data in auth-context.
     * 
     * @param user : Optional. User credential
     * @param pass : Optional. Pass credential
     * @returns Observable with http result. User data is available in auth context.
     */
    signin(user:string='', pass:string=''): Observable<User>{

        return this.http
            .post<User>(BACKEND_HOST+SIGN_IN_API, {user: user, password:pass})
            .pipe(
                tap(userProfile=> this.subjectUser.next(userProfile)), /* emit auth data as side-effect */
                shareReplay()
                );  /* avoid repeated recalls on subscribe. Auth context is global*/            
    }

    /**
     * User sign out method:
     * - handles clearing auth data
     * - invalidates auth-flag
     */
    signout(){
        this.subjectUser.next(null);
    }
}