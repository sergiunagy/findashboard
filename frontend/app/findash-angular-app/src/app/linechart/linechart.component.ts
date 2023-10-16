import { Component, ElementRef, Input} from '@angular/core';

import * as d3 from 'd3'
import { Observable } from 'rxjs';


@Component({
  selector: 'app-linechart',
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent {
  @Input() public data: { value: number, date: Date }[];
  @Input() resize : Observable<DOMRectReadOnly>;

  /* component init flag */
  private isInitialized=false;
  private margin = 5;

  /* the graph element handle. Global to component */
  private svg;
  /* axes handles - global so we can work on them from multiple functions */
  private yScale;
  private xScale;
  private xAxis;
  private yAxis;
  private lineGroup;

  /* Inject a reference to the displayed element */
  constructor(private elRef:ElementRef){}

  ngOnInit(){
    this.createSvg();
    this.drawGraph();
    this.isInitialized = true;
  }

  ngOnDestroy(){
    this.isInitialized = false;
  }

  /**
   * Set up a base SVG and attach it to our display element
   */
  private createSvg(): void {
    /* Make width relative to element boundaries */
    const width = this.elRef.nativeElement.getBoundingClientRect().width;
    /* bind to the linechart child of our element */
    this.svg = d3.select(this.elRef.nativeElement)
    .select('.linechart')
    .append("svg")
}

  /**
   * remove all display groups from the svg.
   * This will clear the drawing space.
   */
  private clearSvg():void{
    d3.select(this.elRef.nativeElement)
      .select('.linechart')
      .selectAll("g")
      .remove();
  }

/**
 *  Set up the drawing space and associate it to our svg
 * make it relative to the size and constraints of the parent svg
 * 
 * @param width : parent svg width
 * @param height : parent svg height
 * @param margin : parent svg margin
 */
private defineDrawArea(width:number, height:number, margin:number=this.margin){

  /* Create drawing elements-group */
  this.svg.attr("width", width + (margin * 2))
  .append("g")
  .attr("transform", "translate(" + margin + "," + margin + ")"); /* position on view */

  /* Set up an inner space for drawing */
  const svgInner = this.svg
    .append('g')
    .style('transform', 'translate(' + margin + 'px, ' + margin + 'px)');

  this.yAxis = svgInner
    .append('g')
    .attr('id', 'y-axis')
    .style('transform', 'translate(' + margin + 'px, 0)');
  
  this.xAxis = svgInner
    .append('g')
    .attr('id', 'x-axis')
    .style("transform", "translate(0, " + (height - 2 * margin) + "px)");

  this.lineGroup = svgInner
    .append('g')
    .append('path')
    .attr('id', 'line')
    .style('fill', 'none')
    .style('stroke', 'red')
    .style('stroke-width', '2px');
}

/**
 * Calculate the x,y axis scaling as functions of our data and draw area dimensions.
 * We need to map our datapoints to the available draw area so we can dynamically scale
 * on dimension changes (resize).
 * 
 * x axis is a time axis 
 * y axis is the value axis
 * @param width : parent svg width
 * @param height : parent svg height
 * @param margin : parent svg margin
*/
private calculateAxisScales(width:number, height:number, margin:number){
  
  this.xScale = d3
            .scaleTime()                                    /* scale for time */
            .domain(d3.extent(this.data, d =>d.date))     /* x domain is our timestamp data */
            .range([this.margin, width - 2 * this.margin]);  /* set range as function of avialble draw space */


  this.yScale = d3
    .scaleLinear()
    .domain([d3.max(this.data, d => d.value) + 1, d3.min(this.data, d => d.value) - 1]) 
    .range([0, height - 2 * margin]) ;   /* linear values scale */

}
/**
 * Draws the graph. 
 * @param ticks_x : configurable parameter for number of ticks on x axis
 * @param ticks_y : configurable parameter for number of ticks on y axis
 * Note:
 * - Configure the ticks so they are visible on the available display area.
 */
private drawGraph(ticks_x:number=6, ticks_y:number=3): void {
    
  const width = this.elRef.nativeElement.getBoundingClientRect().width;
  const height = 140 - (this.margin * 2);

  /* prepare drawing space */
  this.defineDrawArea(width, height, this.margin);
  /* calculate the scaling as a function of data and available space */
  this.calculateAxisScales(width, height, this.margin);
  /* draw the axes */
  const xAxis = d3
    .axisBottom(this.xScale)
    .ticks(ticks_x)                       /* TODO set ticks dynamically, we could add more as the width increases */
    .tickFormat(d3.timeFormat('%H:%M'));  /* Show X values as HH:SS ticks*/
  this.xAxis.call(xAxis); /*draw */

  const yAxis = d3
    .axisRight(this.yScale)               /* set axis to be right oriented . i.e. tick labels go on the right side */
    .ticks(ticks_y);                      

  this.yAxis.call(yAxis); /* draw */

  /* define line data characteristics */
  const line = d3
    .line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveBasis); /* This is a basic curve. Y dimension monotonicity is not suitable
                            for prices since they can remain constant even though x is monotonically
                            increasing. i.e. prices are not monotonic though time is */
  /* map data points to data*/                            
  const points: [number, number][] = this.data.map(
    d => [this.xScale(d.date), this.yScale(d.value)]
  );
  this.lineGroup.attr('d', line(points));
}

  /**
   * Expected to trigger on :
   * - input data changes
   * - resizing (this is caught because on resize we emit a resize event for this element)
   */
  ngOnChanges(){
    /* Allow re-draw only after initial svg is attached to out html element 
    * Note: on data update only we may get away with clearing less often.
    * TODO: it may be possible to bind data and have internal logic of d3 handle 
    * redraws triggered by bound-data changes.
    */
    if(this.isInitialized){
      this.clearSvg();  /* clean the drawing so we don't overwrite  */
      this.drawGraph(); /* re-draw.  */
    }
  }
}
   
