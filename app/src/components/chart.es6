/**
 * Created by yarden on 7/23/15.
 */

import * as d3 from 'd3'

export default function() {

  let data;
  let margin = {top:10, right: 10, bottom: 10, left:10};
  let width = 200, height = 150;

  let svg, svgContainer;

  let xScale = d3.scale.linear();
  let yScale = d3.scale.linear();

  let xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(-height, 0)
    .tickPadding(6);

  let yAxis = d3.sv.axis()
    .scale(y)
    .orient('left')
    .tickSize(-width)
    .tickPadding(6);

  let area = d3.svg.area()
    .interpolate('step-after')
    .x( d => { return x(d.date);})
    .y0(y(0))
    .y1( d => { return y(d.value);});

  let line = d3.svg.line()
    .interpolate('step-after')
    .x( d => { return x(d.date);})
    .y0(y(0))
    .y1( d => { return y(d.value);});

  let zoom = d3.behaviour.zoom()
    .on('zoom', draw);

  let gradient;

  function resize(w, h) {
    svgContainer
      .attr('width', w)
      .attr('height', h);

    x.range([0, w]);
    y.range([h, 0]);
  }

  function init() {
    gradient = svg.append("defs").append("linearGradient")
      .attr("id", "gradient")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fff")
      .attr("stop-opacity", .5);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#999")
      .attr("stop-opacity", 1);

    svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', x(0))
      .attr('y', y(1))
      .attr('width', x(1) - x(0))
      .attr('height', y(0)-y(1));

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + width + ',0)');

    svg.append('path')
      .attr('class', 'area')
      .attr('clip-path', 'url(#clip)')
      .style('fill', 'url(#gradient)');

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
    svg.select('g.x.axis').call(xAxis);
    svg.select('g.y.axis').call(yAxis);
    svg.select('path.area').attr('d', area);
    svg.select('path.line').attr('d', line);
  }

  function api() {}

  api.el = function(el, opt) {
    let selection = typeof el =='string' ? d3.select(el) : el;

    svgContainer = selection.append('svg')
      .attr('width', width)
      .attr('height', height);

    svg = svgContainer.append('g');

    init();
    return this;
  };

  api.resize = function(w, h) {
    resize(w, h);
  };

  api.data = function(series) {
    data = series;
    x.domain([d3.min(data, d => { return d.date; }, d3.max(data, d => { return d.date; }))]);
    y.domain([0, d3.max(data, d => { return d.value; })]);
    zoom.x(x);

    svg.select('path.area').data([data]);
    svg.select('path.line').data([data]);

    draw();
    return this;
  };

  return api;
}