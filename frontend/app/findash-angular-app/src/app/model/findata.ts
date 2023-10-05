import { BehaviorSubject, Observable } from "rxjs";

/* 
  User Object Model
 */
  export interface FinData {
    symbol: string;
    subjData: BehaviorSubject<number[]>;
    obsData: Observable<number[]>;
}