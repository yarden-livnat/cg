/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3';

export default function(options) {

  let margin = {top:5, left: 15, bottom: 20, right:5};

  let width = 200 - margin.left - margin.right;
  let height = 100 - margin.top - margin.bottom;
  let min_x = 0;
  let color = ['#ff8c00', 'lightsteelblue'];
  let dispatch = d3.dispatch('select', 'range');
  let handle;

  let x = d3.scale.linear()
    .domain([min_x, 1])
    .range([0, width]);

  let y = d3.scale.linear()
    .range([height, 0]);

  let xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .tickSize(2)
      .ticks(5);

  let yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
      .tickSize(2)
      .tickFormat(d3.format(',.0f'))
      .ticks(2);


  let brush = d3.svg.brush()
    .x(x)
    .extent([0, 0])
    .on('brushend', () => dispatch.range(brush.extent()));

  let detector = function(selection) {
    selection.each( function(d) {
      let num = d.data.length;
      let max = d3.max(d.data, v => v.p + v.s);
      y.domain([0, max]);
      yAxis.ticks(max > 2 ? 4 : 2);

      let svg = d3.select(this).select('g');
      svg.select('g.x.axis').call(xAxis);
      svg.select('g.y.axis').call(yAxis);

      let columns = svg.select('.data').selectAll('.col')
        .data(d.data);

      columns
        .enter().append('g')
          .attr('class', 'col')
          .attr('transform', d => 'translate(' + x(d.x) + ',0)');

      let bars = columns.selectAll('rect')
        .data(d => [{y0: 0, y1: d.p}, {y0: d.p, y1: d.p + d.s}]);

      bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.y1))
        .attr('width', width/num -1)
        .attr('height', d => y(d.y0) - y(d.y1))
        .attr('fill', (d, i) => color[i]);

      bars.transition()
        .duration(300)
        .attr('y', d => y(d.y1))
        .attr('height', d => y(d.y0) - y(d.y1));
    });
  };

  detector.build = function(selection) {
    width= parseInt(selection.style('width')) - margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;

    x.range([0, width]);
    y.range(([height, 0]));

    let g = selection
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top+ ')');

    g.append('g')
      .attr('class', 'data');



    g.append('g')
      .attr('legend');

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append('text')
        .attr('x', width)
        .attr('dy', '2.2em')
        .attr('text-anchor', 'end')
        .text('probability');

    g.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
      //.append('text')
      //  .attr('transform', 'rotate(-90)')
      //  .attr('y', 6)
      //  .attr('dy', '-2.7em')
      //  .attr('text-anchor', 'end')
      //  .text('encounters');

    handle = g.append('g')
      .attr('class', 'brush')
      .call(brush);

    handle.selectAll('rect')
      .attr('height', height);


    g.append('text')
      .attr('class', 'title')
      .attr('x', 5)
      .attr('y', 5)
      .text(d => d.name)
      .on('click', function(d) {
        dispatch.select(d);
      });

    return g;
  };

  detector.select = function(selection, state) {
    selection.select('.title').classed('selected', state);
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

  detector.minX = function(_) {
    if (!arguments.length) return min_x;
    min_x = _;
    x.domain([min_x, 1]);
    return this;
  };

  detector.on = function(type, listener) {
    dispatch.on(type, listener);
    return this;
  };

  return detector;
}