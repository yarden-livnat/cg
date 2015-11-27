/**
 * Created by yarden on 8/11/15.
 */

import * as d3 from 'd3'

export default function(el) {

  let series;
  let margin = {top:5, right: 30, bottom: 20, left:30};
  let width = 350 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  let title;

  let svg, svgContainer;

  let x = d3.time.scale()
    .range([0, width])
    .nice(d3.time.week, 1);

  let xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(3, 0)
    .tickPadding(4)
    .ticks(2);
    //.tickFormat(d3.time.format("%m/%d"));

  let y = d3.scale.linear()
    .range([height, 0]);

  let yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickSize(3)
    .tickPadding(6)
    .ticks(4);

  let yr = d3.scale.linear()
    .range([height, 0]);

  let yrAxis = d3.svg.axis()
    .scale(yr)
    .orient('right')
    .tickSize(3)
    .tickPadding(6)
    .ticks(2);

  let line = d3.svg.line()
    .x( d => { return x(d.x); })
    .y( d => { return y(d.value); });

  let zoom = d3.behavior.zoom()
    .on('zoom', draw);

  let selection = typeof el =='string' ? d3.select(el) : el;
  selection.attr('class', 'chart');

  width= parseInt(selection.style('width')) - margin.left - margin.right;
  height = parseInt(selection.style('height')) - margin.top - margin.bottom;

  svgContainer = selection.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  svg = svgContainer.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top+ ')');

  x.range([0, width]);
  y.range([height, 0]);
  yr.range([height, 0]);

  let xrange = x.range();
  let yrange = y.range();

  svg.append('text')
    .attr('class', 'title')
    .attr('x', 5)
    .attr('y', 5)
    .text(title);

  svg.append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', xrange[0])
    .attr('y', yrange[1])
    .attr('width', xrange[1]-xrange[0])
    .attr('height', yrange[0]-yrange[1]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(0,0)');

  svg.append('g')
    .attr('class', 'yr axis')
    .attr('transform', 'translate(' + width + ',0)');

  svg.append("path")
    .attr("class", "line")
    .attr("clip-path", "url(#clip");

  svg.append("rect")
    .attr("class", "pane")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

  function resize(w, h) {
    svgContainer
      .attr('width', w)
      .attr('height', h);

    width = w -margin.left - margin.right;
    height = h -margin.top - margin.bottom;

    x.range([0, width]);
    y.range([height, 0]);
    yr.range([height, 0]);

    xAxis.tickSize(3);
    yAxis.tickSize(3);
    yrAxis.tickSize(3);

    let xrange = x.range();
    let yrange = y.range();

    svg.select('#clip rect')
      .attr('x', xrange[0])
      .attr('y', yrange[1])
      .attr('width', xrange[1]-xrange[0])
      .attr('height', yrange[0]-yrange[1]);

    svg.select('g.x.axis')
      .attr('transform', 'translate(0,' + height + ')');

    //svg.select('g.y.axis')
    //  .attr('transform', 'translate(' + width + ',0)');

    svg.select('g.yr.axis')
      .attr('transform', 'translate(' + width + ',0)');

    svg.select('.pane')
      .attr('width', width)
      .attr('height', height)
      .call(zoom);
  }


  function draw() {
    if (series) {
      let left = false, right = false;
      for (let d of series) {
        if (d.right) right = true;
        else left = true;
        if (left && right) break;
      }
      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').attr('visibility', left && 'visible' || 'hidden').call(yAxis);
      svg.select('g.yr.axis').attr('visibility', right && 'visible' || 'hidden').call(yrAxis);

      let ly = d => y(d.value);
      let ry = d => yr(d.value);

      let lines = svg.selectAll('path.line')
        .data(series)
          .attr('stroke', d => { return d.color; })
          .attr('stroke-dasharray', d => { return d.marker == 'dash' ? '3' : '0'; })
          .attr('d', d => line.y( d.right ? ry : ly ).interpolate(d.interpolate || 'cardinal')(d.values));

      lines.exit().remove();
    }
  }

  return {
    title(name) {
      title = name;
      if (svg) svg.select('.title').text(title);
      return this;
    },

    data(list) {
      series = list;
      if (series.length > 0) {
        let n = series.length;
        let x_min = series[0].values[0].x;
        let x_max = series[0].values[series[0].values.length - 1].x;
        let y_max = 0;
        let yr_max = 0;
        for(let s of series) {
          let v = d3.max(s.values, d => d.value);
          if (s.right) yr_max = Math.max(yr_max, v);
          else y_max = Math.max(y_max, v);
        }
        x.domain([x_min, x_max]);
        y.domain([0, y_max]);
        yr.domain([0, yr_max]);

        yAxis.ticks(y_max > 3 && 3 || y_max);
        yrAxis.ticks(yr_max > 3 && 3 || yr_max);

        zoom.x(x);
      }

      let lines = svg.selectAll('path.line')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr("clip-path", "url(#clip)");

      draw();
      return this;
    },


    resize(size) {
      resize(size[0], size[1]);
      draw();
      return this;
    },

    xscale(s) {
      if (!arguments.length) return x;
      s.domain(x.domain()).range(x.range()).nice(5);
      x = s;
      xAxis.scale(x);
      return this;
    }
  }
}