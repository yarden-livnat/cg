/**
 * Created by yarden on 8/13/15.
 */

import * as d3 from 'd3'

export default function() {

  let
    margin = {top: 5, right:5, bottom: 10, left: 5},
    width = 100-margin.left-margin.right,
    height = 50 - margin.top - margin.bottom,
    duration = 500,
    svg, bins, _series, handle,
    dispatch = d3.dispatch('select');

  let x = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, 1])
    .rangeRound([height, 0]);

  let xAxis = d3.axisBottom(x)
    .ticks(0);

  let brush = d3.brushX()
    .extent([0, 1])
    .on('brush', brushed);

  function brushed() {
    dispatch.call('select', this, brush.extent());
  }

  function draw() {
    if (!svg) return;

    svg.select('.x')
      .call(xAxis);

    let bar = svg.select('#bars').selectAll('.bar')
      .data(bins, function (d, i) { return d.x0; });

    bar.enter().append('rect')
      .attr('class', 'bar')
      .attr('y', height)
      .attr('height', 0)
      .merge(bar)
        .attr('x', function (d) { return x(d.x0); })
        .attr('width', d => x(d.x1) - x(d.x0) -1)
        .transition()
        .duration(duration)
        .attr('y', function (d) { return y(d.length); })
        .attr('height', function (d) { return height - y(d.length); });

    bar.exit()
      .remove();
  }

  function selector(selection) {
    svg = selection.append('g')
      .attr('class', 'selector')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
      .attr('id', 'bars');

    svg.append('g')
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'steelblue')
      .style('opacity', 0.0);

    handle = svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    handle.selectAll('rect')
      .attr('height', height);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);
  }

  selector.width = function(w) {
    if (!arguments.length) return width + margin.left + margin.right;
    width = w - margin.left - margin.right;
    x.range([0, width]);

    draw();
    return selector;
  };

  selector.height = function(h) {
    if (!arguments.length) return height + margin.top + margin.bottom;
    height = h - margin.top - margin.bottom;
    y.rangeRound([height, 0]);
    //yAxis.ticks( Math.max(2, height/50));
    if (handle) {
      handle.selectAll('rect')
        .attr('height', height);
    }

    draw();
    return selector;
  };

  selector.margin = function(m) {
    if (!arguments.length) return margin;
    svg.attr('translate', 'transform(' + (m.left - margin.left) + ',' + (m.top - margin.top) + ')');
    margin = m;
    return selector;
  };

  selector.data = function(series) {
    _series = series;
    bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20))
    (series);

    y.domain([0, d3.max(bins,  d => d.length)]);

    draw();
    return selector;
  };

  selector.select = function(r) {
    brush.extent(r);
    return this;
  };

  selector.xdomain = function(from, to) {
    x.domain([from,  to]);
    let save=duration;
    duration = 0;
    this.bins(_series);
    duration = save;
  };

  selector.on = function(type, listener) {
    dispatch.on(type, listener);
    return selector;
  };

  return selector;
};

