import { Component, ElementRef, Renderer2, OnInit,Input } from '@angular/core';
import * as d3 from 'd3'
import { FinData } from '../model/findata';

@Component({
  selector: 'app-linechart',
  templateUrl: './linechart.component.html',
  styleUrls: ['./linechart.component.css']
})
export class LinechartComponent {

  @Input() public data: { value: number, date: Date }[];

  private isInitialized=false;
  // private svg: any;
  private margin = 10;
  private width = 200 - (this.margin * 2);
  private height = 140 - (this.margin * 2);

  public svg;
  public svgInner;
  public yScale;
  public xScale;
  public xAxis;
  public yAxis;
  public lineGroup;


  constructor (private elRef: ElementRef, 
              private renderer: Renderer2,
              ){}

  ngOnInit() {
    this.createSvg();
    this.drawLine();
    this.isInitialized = true;
  }

  ngAfterViewChecked(){

  }

  ngOnDestroy(){
    this.isInitialized = false;
  }

  private refreshSvg(){
    this.svg
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");

    this.svgInner = this.svg
      .append('g')
      .style('transform', 'translate(' + this.margin + 'px, ' + this.margin + 'px)');


    this.xScale = d3.scaleTime().domain(d3.extent(this.data, d =>d.date));

    this.yScale = d3
      .scaleLinear()
      .domain([d3.max(this.data, d => d.value) + 1, d3.min(this.data, d => d.value) - 1])
      .range([0, this.height - 2 * this.margin]);

    this.yAxis = this.svgInner
      .append('g')
      .attr('id', 'y-axis')
      .style('transform', 'translate(' + this.margin + 'px, 0)');

    this.xAxis = this.svgInner
      .append('g')
      .attr('id', 'x-axis')
      .style("transform", "translate(0, " + (this.height - 2 * this.margin) + "px)");
  }


  private createSvg(): void {
      this.svg = d3.select(this.elRef.nativeElement)
      .select('.linechart')
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");

      this.svgInner = this.svg
        .append('g')
        .style('transform', 'translate(' + this.margin + 'px, ' + this.margin + 'px)');


      this.xScale = d3.scaleTime().domain(d3.extent(this.data, d =>d.date));
  
      this.yScale = d3
        .scaleLinear()
        .domain([d3.max(this.data, d => d.value) + 1, d3.min(this.data, d => d.value) - 1])
        .range([0, this.height - 2 * this.margin]);

      this.yAxis = this.svgInner
        .append('g')
        .attr('id', 'y-axis')
        .style('transform', 'translate(' + this.margin + 'px, 0)');

      this.xAxis = this.svgInner
        .append('g')
        .attr('id', 'x-axis')
        .style("transform", "translate(0, " + (this.height - 2 * this.margin) + "px)");

      this.lineGroup = this.svgInner
        .append('g')
        .append('path')
        .attr('id', 'line')
        .style('fill', 'none')
        .style('stroke', 'red')
        .style('stroke-width', '2px');
  }


  private drawLine(): void {
    
    this.width = this.elRef.nativeElement.getBoundingClientRect().width;
    this.svg.attr('width', this.width);

    this.xScale.range([this.margin, this.width - 2 * this.margin]);
    const xAxis = d3
      .axisBottom(this.xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat('%m / %Y'));
    this.xAxis.call(xAxis);
    const yAxis = d3
      .axisRight(this.yScale)
      .ticks(3);
    this.yAxis.call(yAxis);

    const line = d3
      .line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveMonotoneX);
    const points: [number, number][] = this.data.map(
      d => [this.xScale(d.date), this.yScale(d.value)]
    );
    this.lineGroup.attr('d', line(points));
  }

  public ngOnChanges(changes): void {

    if (this.isInitialized && changes.hasOwnProperty('data') && this.data) {
       this.refreshSvg();
       this.drawLine();
       window.addEventListener('resize', () => this.drawLine());
    }
  }
}
