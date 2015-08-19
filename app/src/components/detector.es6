/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3'

export default function(options) {

  let margin = {top:5, right: 25, bottom: 15, left:5};

  let width = 200 - margin.right - margin.left;
  let height = 100 - margin.top - margin.bottom;

  let stack = d3.layout.stack()
    .offset('wiggle')
    .values( d => d.values );

  let color = ['#ff8c00', '#98abc5'];

  let x = d3.scale.linear()
    .domain([0.5, 1])
    .range([0, width]);

  let y = d3.scale.linear()
    .range([height, 0]);

  let xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(5);

  let yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .ticks(3);


  let detector = function(selection) {
    selection.each( function(d) {
      let num = d.data.length;
      let max = d3.max(d.data, v => v.p + v.s);
      y.domain([0, max]);

      let svg = d3.select(this).select('g');

      svg.select('x.axis').call(xAxis);
      svg.select('y.axis').call(yAxis);

      let columns = svg.selectAll('.col')
        .data(d.data)
        .enter().append('g')
          .attr('class', 'col')
          .attr('transform', d => 'translate(' + x(d.x) + '0)');

      let bars = columns.selectAll('rect')
        .data(d => [{y0: 0, y1: d.p}, {y0: d.p, y1: d.p + d.s}]);

      bars.enter()
        .append('rect')
        .attr('class', 'bar')
        //.attr('x', d => x(d.x))
        .attr('y', d => d.y1)
        .attr('width', width/num)
        .attr('height', d => y(d.y0) - y(d.y1))
        .attr('fill', (d, i) => color[i]);

      bars.transition()
        .attr('y', d => y(d.y0+ d.y))
        .attr('y', d => d.y1)
        .attr('height', d => y(d.y0) - y(d.y1));
    });
  };

  detector.build = function(selection) {
    width= parseInt(selection.style('width')) - margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;

    let g = selection
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top+ ')');

    g.append('text')
        .attr('class', 'title')
        .attr('x', 5)
        .attr('y', 5)
        .text(d => d.name);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text')
      .attr('dy', '0.7em')
      .attr('text-anchor', 'end')
      .text('probability');

    g.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    return this;
  };

  detector.width = function(w) {
    if (!arguments.length) return width + margin.left + margin.right;
    width = w - margin.left - margin.right;
    x.range([0, width]);
    return this;
  };

  detector.height = function(h) {
    if (!arguments.length) return height + margin.top + margin.bottom;
    height = h - margin.top - margin.bottom;
    y.range([height, 0]);
    return this;
  };

  return detector;
}