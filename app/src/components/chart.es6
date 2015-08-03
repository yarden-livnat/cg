/**
 * Created by yarden on 7/23/15.
 */

import * as d3 from 'd3'

export default function() {

  let data;
  let margin = {top:5, right: 30, bottom: 20, left:0};
  let width = 350 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  let title;

  let svg, svgContainer;

  let x = d3.time.scale()
    .range([0, width])
    .nice(5);

  let y = d3.scale.linear()
      .range([height, 0]);

  let xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(3, 0)
    .tickPadding(4)
    .ticks(2);

  let yAxis = d3.svg.axis()
    .scale(y)
    .orient('right')
    .tickSize(3)
    .tickPadding(6)
    .ticks(4);

  let line = d3.svg.line()
    .x( d => { return x(d.x); })
    .y( d => { return y(d.value); });

  let zoom = d3.behavior.zoom()
    .on('zoom', draw);

  function resize(w, h) {
    svgContainer
      .attr('width', w)
      .attr('height', h);

    width = w -margin.left - margin.right;
    height = h -margin.top - margin.bottom;

    x.range([0, width]);
    y.range([height, 0]);

    xAxis.tickSize(3);
    yAxis.tickSize(3);

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
    x.range([0, width]);
    y.range([height, 0]);

    let xr = x.range();
    let yr = y.range();

    svg.append('text')
      .attr('class', 'title')
      .attr('x', 5)
      .attr('y', 5)
      .text(title);

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

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");

    svg.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip");

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

      let lines = svg.selectAll('path.line')
        .data(data)
        .attr('stroke', d => { return d.color; })
        .attr('stroke-dasharray', d => { return d.marker == 'dash' ? '3' : '0'; })
        .attr('d', d => { return line.interpolate(d.interpolate || 'cardinal')(d.values); });

      lines.exit().remove();
    }
  }

  let api = {
    title(name) {
      title = name;
      if (svg) {
        svg.select('.title').text(title);
      }
      return this;
    }
  };

  api.el = function(el, opt) {
    let selection = typeof el =='string' ? d3.select(el) : el;
    selection.attr('class', 'chart');

    width= parseInt(selection.style('width')) - margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;

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
    return this;
  };

  api.data = function(series) {
    data = series;
    if (data.length > 0) {
      let n = series.length;
      let x_min = series[0].values[0].x;
      let x_max = series[0].values[series[0].values.length-1].x;
      let y_max = 0;
      for (let s of series) {
        y_max = Math.max(y_max, d3.max(s.values, d => { return d.value; }));
      }
      x.domain([x_min, x_max]);
      y.domain([0, y_max]);
      zoom.x(x);
    }

    let lines = svg.selectAll('path.line')
        .data(data)
      .enter()
        .append('path')
        .attr('class', 'line')
        .attr("clip-path", "url(#clip)");

    draw();
    return this;
  };

  api.resize = function(size) {
    resize(size[0], size[1]);
    draw();
    return this;
  };

  api.scale = function(s) {
    x = s;
    x.range([0, width])
    .nice(5);

    xAxis.scale(x);
    return this;
  };

  return api;
}