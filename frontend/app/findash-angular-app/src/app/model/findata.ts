import { BehaviorSubject, Observable } from "rxjs";

/* 
  Financial data Object Model
 */
  export interface FinData {
    date: string;
    value: number;
}