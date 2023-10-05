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
    /* calculate mean over the relevant interval*/
    const sample = Array.from(this.data)
                        .filter(el=>moment(el.date).unix() >= intervalThreshold)
                        .map(el=> el.value)
    /* If no data found for interval, push last value in data- TODO: this is not really correct since we may be far from the actual value */
    if(!sample){
      sample.push(this.data[-1].value);
    }
    const avg = sample.reduce((sum, value)=>sum + value, 0)/sample.length;
                        
    return avg.toPrecision(4);
  }

}
