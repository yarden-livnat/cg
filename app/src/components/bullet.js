/**
 * Created by yarden on 8/7/15.
 */

import * as d3 from 'd3'

export default function() {

  let margin = {left: 2, top: 2, right: 2, bottom: 2};
  let value;
  let width = 50, height = 18;
  let duration = 500;

  function bulletWidth(x) {
    let x0 = x(0);
    return function(d) { return Math.abs(x(d) - x0); };
  }

  function bullet(selection) {
    selection.each( function(d) {
      let values = [d.value[1], d.value[0]];
      let x1 = d3.scale.linear().domain([0, d.value[d.value.length-1]]).range([0, width - margin.left - margin.right]);

      let x0 = this.__chart__ || d3.scale.linear()
        .domain([0, Infinity])
        .range(x1.range());

      let w0 = bulletWidth(x0);
      let w1 = bulletWidth(x1);

      let svg = d3.select(this).selectAll('svg').data([d]);
      svg.enter().append('svg')
          .attr('class', 'bullet')
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.attr('width', width)
         .attr('height', height);

      let range = svg.select('g').selectAll('rect').data(values);

      range.enter().append('rect')
          .attr('class', (d,i) => 'range s' + i)
          .attr('width', w0)
          .attr('height', height)
          //.attr('x', x0)
        .transition()
          .duration(duration)
          .attr('width', w1);
          //.attr('x', x1);

      range.transition()
        .duration(duration)
        //.attr('x', x1)
        .attr('width', w1)
        .attr('height', height);

      let labels = svg.select('g').selectAll('text').data(d.value);
      labels.enter().append('text')
        //.attr('class', (d, i) => 'range s' + i)
        //.attr("text-anchor", "middle")
        //.attr("dy", "1em")
        .attr('y', 10)
        .attr('x', (d, i) => i*(width-20));

      labels.text( d => d);
    });
  }

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  return bullet;
}
