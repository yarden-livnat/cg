/**
 * Created by yarden on 7/23/15.
 */

import * as d3 from 'd3'

export default function() {

  let data;
  let margin = {top:10, right: 60, bottom: 30, left:20};
  let width = 350 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  let svg, svgContainer;

  let x = d3.time.scale()
    .range([0, width])
    .nice(5);

  let y = d3.scale.linear()
      .range([height, 0]);

  let xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(-height, 0)
    .tickPadding(6)
    .ticks(4);

  let yAxis = d3.svg.axis()
    .scale(y)
    .orient('right')
    .tickSize(-width)
    .tickPadding(6)
    .ticks(4);

  //let area = d3.svg.area()
  //  .interpolate('step-after')
  //  .x( d => { return x(d.date); })
  //  .y0(y(0))
  //  .y1( d => { return y(d.value); });

  let line = d3.svg.line()
    .interpolate('step-after')
    .x( d => { return x(d.date); })
    .y( d => { return y(d.value); });

  let zoom = d3.behavior.zoom()
    .on('zoom', draw);

  //let gradient;

  function resize(w, h) {
    svgContainer
      .attr('width', w)
      .attr('height', h);

    width = w -margin.left - margin.right;
    height = h -margin.top - margin.bottom;

    x.range([0, width]);
    y.range([height, 0]);

    xAxis.tickSize(-width);
    yAxis.tickSize(-width);

    let xr = x.range();
    let yr = y.range();
    svg.select('#clip rect')
      .attr('x', xr[0])
      .attr('y', yr[1])
      .attr('width', xr[1]-xr[0])
      .attr('height', yr[0]-yr[1]);

    svg.select('g.y.axis')
      .attr('transform', 'translate(' + width + ',0)');

    svg.select('g.x.axis')
      .attr('transform', 'translate(0,' + height + ')');

    svg.select('.pane')
      .attr('width', width)
      .attr('height', height)
      .call(zoom);
  }

  function init() {
    //gradient = svg.append("defs").append("linearGradient")
    //  .attr("id", "gradient")
    //  .attr("x2", "0%")
    //  .attr("y2", "100%");
    //
    //gradient.append("stop")
    //  .attr("offset", "0%")
    //  .attr("stop-color", "#fff")
    //  .attr("stop-opacity", .5);
    //
    //gradient.append("stop")
    //  .attr("offset", "100%")
    //  .attr("stop-color", "#999")
    //  .attr("stop-opacity", 1);

    let xr = x.range();
    let yr = y.range();
    svg.append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('x', xr[0])
        .attr('y', yr[1])
        .attr('width', xr[1]-xr[0])
        .attr('height', yr[0]-yr[1]);

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + width + ',0)');

    //svg.append('path')
    //  .attr('class', 'area')
    //  .attr('clip-path', 'url(#clip)')
    //  .style('fill', 'url(#gradient)');

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    svg.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip)");

    svg.append("rect")
      .attr("class", "pane")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);
  }

  function draw() {
    if (data) {
      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);


      let lines = data.map( item => { return item.values;});

      //svg.select('path.area').attr('d', area);
      svg.selectAll('path.line')
        .data(lines)
        .attr('d', line);
    }
  }

  function api() {}

  api.el = function(el, opt) {
    let selection = typeof el =='string' ? d3.select(el) : el;
    selection.attr('class', 'chart');

    svgContainer = selection.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    svg = svgContainer.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top+ ')');

    init();
    return this;
  };

  api.resize = function(w, h) {
    resize(w, h);
    if (data) draw();
  };

  api.data = function(series) {
    data = series;
    if (data.length > 0) {
      let n = series.length;
      let x_min = series[0].values[0].date;
      let x_max = series[0].values[series[0].values.length-1].date;
      let y_max = 0;
      for (let s of series) {
        y_max = Math.max(y_max, d3.max(s.values, d => { return d.value; }));
      }
      //x.domain([d3.min(data, d => { return d.date; }), d3.max(data, d => { return d.date; })]);
      //y.domain([0, d3.max(data, d => { return d.value; })]);
      x.domain([x_min, x_max]);
      y.domain([0, y_max]);
      zoom.x(x);
    }

    //svg.select('path.area').data([data]);
    let lines = svg.selectAll('path.line')
        .data(data)
      .enter()
        .append('path')
        .attr('class', 'line');

    draw();
    return this;
  };

  api.resize = function(size) {
    resize(size[0], size[1]);
    draw();
    return this;
  };

  return api;
}