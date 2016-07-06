/**
 * Created by yarden on 8/8/15.
 */

import * as d3 from 'd3'

export default function() {

  let margin = {left: 0, top: 0, right: 0, bottom: 0};
  let max = 1;
  let width = 50, height = 14;
  let duration = 500;

  function widthFunc(x) {
    let x0 = x(0);
    return function(d) { return Math.abs(x(d) - x0); };
  }

  function bar(selection) {
    selection.each( function(d) {
      let x1 = d3.scaleLinear().domain([0, max]).range([0, width - margin.left - margin.right]);

      let x0 = this.__chart__ || d3.scaleLinear()
          .domain([0, Infinity])
          .range(x1.range());

      let w0 = widthFunc(x0);
      let w1 = widthFunc(x1);

      let svg = d3.select(this).selectAll('svg').data([d]);
      svg.enter().append('svg')
        .attr('class', 'bar')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .merge(svg)
          .attr('width', width)
          .attr('height', height);

      let range = svg.select('g').selectAll('rect').data([d.value]);

      range.enter().append('rect')
        .attr('width', 0)
        .attr('height', height)
        //.transition()
        //.duration(duration)
        //.attr('width', w1)
      .merge(range)
        .transition()
        .duration(duration)
        .attr('width', w1);
        //.attr('height', height);

      let labels = svg.select('g').selectAll('text').data([d.value]);
      labels.enter().append('text')
        .attr('y', 10)
        .attr('x', (d, i) => i*(width-20))
        .merge(labels)
          .text( d => d);
    });
  }

  bar.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return this;
  };

  bar.max = function(v) {
    if (!arguments.length) return max;
    max = v;
    return this;
  };

  return bar;
}
