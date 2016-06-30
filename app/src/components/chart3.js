/**
 * Created by yarden on 8/11/15.
 */

import * as d3 from 'd3'

export default function(el, useRight) {

  let AXIS_OFFSET = 20;
  let margin = {top:5, right: 5+(hasRight && AXIS_OFFSET || 0), bottom: 15, left:5+AXIS_OFFSET};
  let width = 350 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;
  let hasRight = useRight || false;
  let title;
  let series;
  let svg, svgContainer;

  let selection = typeof el =='string' ? d3.select(el) : el;
  selection.classed('chart', true);

  width= parseInt(selection.style('width')) - margin.left - margin.right;
  height = parseInt(selection.style('height')) - margin.top - margin.bottom;

  let x = d3.scaleTime()
    .range([0, width])
    .nice(d3.timeWeek, 1);

  let xAxis = d3.axisBottom(x)
    // .scale(x)
    // .orient('bottom')
    .tickSize(3, 0)
    .tickPadding(4)
    .ticks(2);
  //.tickFormat(d3.time.format("%m/%d"));

  let y = d3.scaleLinear()
    .range([height, 0]);

  let yAxis = d3.axisLeft(y)
    // .scale(y)
    // .orient('left')
    .tickSize(3)
    .tickPadding(6)
    .ticks(4);

  let yr;

  let yrAxis;
  if (hasRight) {
    yr = d3.scaleLinear()
      .range([height, 0]);

    yrAxis = d3.axisRight(yr)
      // .scale(yr)
      // .orient('right')
      .tickSize(3)
      .tickPadding(6)
      .ticks(2);
  }

  let line = d3.line()
    .x( d => { return x(d.x); })
    .y( d => { return y(d.value); });

  let area = d3.area()
    .x( d => { return x(d.x); })
    .y0(height)
    .y1( d => { return y(d.value); })
    .curve(d3.curveCardinal);

  let zoom = d3.zoom()
    .on('zoom', draw);


  svgContainer = selection.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  svg = svgContainer.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top+ ')');
  //
  //x.range([0, width]);
  //y.range([height, 0]);
  if (hasRight) {
    yr.range([height, 0]);
  }

  let xrange = x.range();
  let yrange = y.range();



  //svg.append('clipPath')
  //  .attr('id', 'clip')
  //  .append('rect')
  //  .attr('x', xrange[0])
  //  .attr('y', yrange[1])
  //  .attr('width', xrange[1]-xrange[0])
  //  .attr('height', yrange[0]-yrange[1]);

  //svg.append("path")
  //  .attr("class", "line")
  //  .attr("clip-path", "url(#clip");

  //svg.append("rect")
  //  .attr("class", "pane")
  //  .attr("width", width)
  //  .attr("height", height)
  //  .call(zoom);

  svg.append('g')
    .attr('class', 'areas');

  svg.append('g')
    .attr('class', 'lines');

  svg.append('text')
    .attr('class', 'title')
    .attr('x', 5)
    .attr('y', 5)
    .text(title);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(0,0)');

  if (hasRight) {
    svg.append('g')
      .attr('class', 'yr axis')
      .attr('transform', 'translate(' + width + ',0)');
  }

  function getSize(el) {
    let d3el = d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }

  function resize(w, h) {
    svgContainer
      .attr('width', w)
      .attr('height', h);

    width = w -margin.left - margin.right;
    height = h -margin.top - margin.bottom;

    x.range([0, width]);
    xAxis.tickSize(3);

    y.range([height, 0]);
    yAxis.tickSize(3);

    if (hasRight) {
      yr.range([height, 0]);
      yrAxis.tickSize(3);
    }

    let xrange = x.range();
    let yrange = y.range();

    area.y0(y(0));

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
      let ly = d => y(d.value);
      let ry = hasRight ? d => yr(d.value) : ly;

      let areas = svg.select('.areas').selectAll('.area')
        .data(series.filter(d => d.type == 'area'));

      areas.enter()
        .append('path')
        .attr('class', 'area')
        //.attr("clip-path", "url(#clip)");
        .merge(areas)
          .style('fill', d => { return d.color; })
          .attr('d', d => area(d.values));

      areas.exit().remove();

      let lines = svg.select('.lines').selectAll('.line')
        .data(series.filter(d => d.type == 'line'));

      lines.enter()
        .append('path')
        .attr('class', 'line')
        //.attr("clip-path", "url(#clip)");
        .merge(lines)
        .attr('stroke', d => { return d.color; })
          .attr('stroke-dasharray', d => { return d.marker == 'dash' ? '3' : '0'; })
          .attr('d', d => line.y( d.right ? ry : ly ).interpolate(d.interpolate || 'cardinal')(d.values));

      lines.exit().remove();

      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);
      if (hasRight) {
        svg.select('g.yr.axis').call(yrAxis);
      }
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

        yAxis.ticks(y_max > 3 && 3 || y_max);

        if (hasRight) {
          yr.domain([0, yr_max]);
          yrAxis.ticks(yr_max > 3 && 3 || yr_max);
        }

        zoom.x(x);
      }

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
      s.range([0, width]);
      x = s;
      xAxis.tickFormat(s.tickFormat());
      xAxis.scale(x);
      return this;
    }
  }
}