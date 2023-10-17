import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import { now } from 'moment';

@Component({
  selector: 'app-avgcalc',
  templateUrl: './avgcalc.component.html',
  styleUrls: ['./avgcalc.component.css']
})
export class AvgcalcComponent {

  @Input() public data: {date: Date, value: number}[];
  
  getAvgForMin(min:number):string{

    const toSec = (min) => min*60;
    const intervalThreshold = moment().unix() - toSec(min);
    const last_val = (arr) => arr[arr.length-1].value;

    /* calculate mean over the relevant interval*/
    const sample = Array.from(this.data)
                        .filter(el=>moment(el.date).unix() >= intervalThreshold);
                        
    /* If no data found for interval, push last value in data- TODO: this is not really correct since we may be far from the actual value */
    if(sample.length===0){
      // console.log(`No data for the requested interval: last ${min} minutes. Filling with last value`);
      return last_val(this.data).toPrecision(4);
    }

    const avg = sample.map(el=> el.value)
                     .reduce((sum, value)=>sum + value, 0)/sample.length;
    

    return avg.toPrecision(4);
  }

   
}
