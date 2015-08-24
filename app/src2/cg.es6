/**
 * Created by yarden on 8/24/15.
 */

import d3 from 'd3';

import {cg as opt} from '/config';
import Selector from './components/selector';
import Graph from '/.graph';

export default function() {
  let width = 200, height = 200;
  let showEdges = false;

  let force = d3.layout.force()
    .on('tick', updatePosition)
    .on('end', forceDone);

  let x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 1]);

  let y = d3.scale.linear()
    .domain([0, 1])
    .range([0, 1]);

  let nodesRange = [0, 1],
      edgesRange = [0.7, 1];

  let nodesSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      nodesRange = r;
      render(opt.canvas.fastDuration);
      updateEdgesSelector();
    });

  let edgesSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select',  r => { edgesRange = r; render(opt.canvas.fastDuration); });


  function updatePosition() {}
  function forceDone() {}
  function render() {}

  function build() {
    let svg = d3.select(this)
      .append('svg');

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', Math.max(0, height - edgeSelector.height() -10));

    /* selectors */
    let sg = svg.append('g')
      .attr('class', 'cgSelectors');

    nodesSelector(sg.append('g').attr('class', 'nodesSelector'));

    sg.append('text')
      .attr('transform', 'translate(20,'+(nodesSelector.height()+ 5) + ')')
      .text('topics');

    edgesSelector(sg.append('g')
      .attr('class', 'edgesSelector')
      .attr('transform', 'translate(' + (nodesSelector.width() + 10) +',0)'));

    sg.append('text')
      .attr('transform', 'translate(' + (20 + nodesSelector.width() + 10) +',' + (nodesSelector.height() + 5) + ')')
      .text('relations')
      .on('click', () => { showEdges = !showEdges; render(); });


    let g = svg.append('g');

    g.append('g').attr('class', 'links');
    g.append('g').attr('class', 'nodes');

    addListeners();

    return g;
  }

  function addListeners() {

  }

  let cg = function(selection) {
    selection.each(function(d) {
      let g = d3.select(this).select('g');
      if (g.empty()) g = build();


    });
  };

  cg.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  cg.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  cg.render = function() {
    return this;
  };

  return cg;
}