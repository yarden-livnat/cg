/**
 * Created by yarden on 8/25/15.
 */
/**
 * Created by yarden on 8/24/15.
 */

import d3 from 'd3';
import postal from 'postal'

import {cgOptions} from '../config';
import {topicsMap} from '../service';

import Selector from './../components/Selector';
import Graph from './../graph';

export default function() {
  let width = 200, height = 200;
  let dimension;
  let group;

  let graph = Graph();
  let drag = d3.behavior.drag()
    .origin(function (d) { return {x: d.x, y: d.y}; })
    .on('dragstart', onDragStart)
    .on('drag', onDrag)
    .on('dragend', onDragEnd);

  let offsetX, offsetY;

  function onDragStart(d, mx, my) {
    d.fixed |= 2;
    offsetX = d3.event.sourceEvent.layerX - x(d.x);
    offsetY = d3.event.sourceEvent.layerY - y(d.y);
  }


  function onDrag(d) {
    d3.select(this).classed("fixed", d.fixed |= 3);
    d.x = d.px = x.invert(d3.event.sourceEvent.layerX-offsetX);
    d.y = d.py = y.invert(d3.event.sourceEvent.layerY-offsetY);
    d3.select(this).attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    });
    d3links.call(edgeRenderer.update);
  }

  function onDragEnd(d) {
    d.fixed &= ~6;
  }

  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }

  let container;
  let svg, svgLinks, svgNodes;

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

  postal.subscribe({channel: 'global', topic: 'render', callback: update});

  function update() {
    let prev = new Map();
    graph.nodes().forEach(node => prev.set(node.id, node));

    graph.nodes( group.top(Infinity).map( item => {
      let topic = topicsMap.get(item.key);
      let node = prev.get(topic)
        || {
          id: item.key,
          label: topic.label,
          topic: topic,
          x: Math.random() * width,
          y: Math.random() * height,
          scale: 1
        };

      node.items = item.value.map( entry => entry.enc_id);
      node.items.sort( (a,b) => a - b);
      return node;
    }));

    render(cgOptions.canvas.duration);
  }



  function updatePosition() {}
  function forceDone() {}

  function render(duration) {
    let d3Nodes = svgNodes.selectAll('.node')
      .data(graph.nodes(), d => d.id);

    d3Nodes.enter()
      .call(Node);

    d3Nodes
      .transition().duration(duration)
      .style('opacity', 1)
      .select('.scaledTag')
      .call(scaleNode);

    d3Nodes.exit()
      .transition().duration(duration)
      .style('opacity', 1e-6)
      .remove();

  }

  function Node() {
    let g = this.append('g')
        .attr('class', 'node')
        .style('opacity', 0.1)
    //.on('mousedown', mousedown)
    //.on('mouseup', mouseup)
    //.on("dblclick", dblclick)
      ;

    g.append('circle')
      .attr('class', 'circle')
      .attr('r', cgOptions.canvas.nodeRadius)
      //.on('mouseover', mouseover)
      //.on('mouseout', mouseout)
    ;

    let tag = g.append('g')
      .attr('class', 'tag');

    let scaled = tag.append('g')
      .attr('class', 'scaledTag');

    let frame = scaled.append('g')
        .classed('frame', true)
        .style('opacity', 0)
    //.attr('visibility', 'hidden')
      ;

    frame.append('rect')
      .classed('border', true);

    frame.append('rect')
      .classed('bg', true);

    scaled.append('text')
      .attr('class', 'tag')
      .attr('stroke', function (d) { return d.color; })
      .attr('fill', function (d) { return d.color; })
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .text(function (d) {return d.label; });

    scaled.each(function(d) {
      let text = this.childNodes[1];
      let bbox = text.getBBox();

      d.w = bbox.width;
      d.h = bbox.height;

      d3.select(this).select('.bg')
        .attr('width', bbox.width-2)
        .attr('height', bbox.height-2)
        .attr('x', bbox.x+1)
        .attr('y', bbox.y+1);

      d3.select(this).select('.border')
        .attr('width', bbox.width)
        .attr('height', bbox.height)
        .attr('y', bbox.y);

    });

    scaled.call(scaleNode);

    g.attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });
    g.call(drag);
  }

  function scaleNode(node) {
    node.attr('transform', function (d) {
        return 'translate(7, 0) scale(' + cgOptions.canvas.nodeScale(d.scale) + ')';
      }
    );
  }

  function build(selection) {
    svg = selection
      .append('svg');

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', Math.max(0, height - edgesSelector.height() -10));

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

    svgLinks = g.append('g').attr('class', 'links');
    svgNodes = g.append('g').attr('class', 'nodes');

    addListeners();

    return g;
  }

  function addListeners() {
  }

  let cg = function(selection) {
    build(selection);
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

  cg.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    group = dimension.group().reduce(
      (p,v) => { p.push(v); return p; },
      (p,v) => { p.splice(p.index(v), 1); return p; },
      () => []);
    return this;
  };

  cg.resize = function(size) {
    width = size[0];
    height = size[1];

  };


  return cg;
}