/**
 * Created by yarden on 8/24/15.
 */

import d3 from 'd3';
import postal from 'postal'

import {cgOptions} from '../config';
import {topicsMap} from '../service';

import Selector from '../components/selector';

import Graph from './graph';
import {NodeRenderer, EdgeRenderer} from './renderers';

export default function() {
  let width = 200, height = 200;
  let dimension;
  let group;

  let container, svg, svgLinks, svgNodes, overlay;
  let d3Nodes, d3Links;

  let x = d3.scale.linear()
    .domain([0, 1])
    .range([0, 1]);

  let y = d3.scale.linear()
    .domain([0, 1])
    .range([0, 1]);

  let nodeRenderer = NodeRenderer()
      .radius(cgOptions.canvas.nodeRadius)
      .scaleFunc(cgOptions.canvas.nodeScale);

  let edgeRenderer = EdgeRenderer()
    .scale(cgOptions.canvas.edgeScale)
    .opacity(cgOptions.canvas.edgeOpacity)
    .duration(cgOptions.canvas.duration)
    .x(x)
    .y(y);

  let graph = Graph();

  let drag = d3.behavior.drag()
    .origin(function (d) { return {x: d.x, y: d.y}; })
    .on('dragstart', onNodeDragStart)
    .on('drag', onNodeDrag)
    .on('dragend', onNodeDragEnd);

  let offsetX, offsetY;

  let showEdges = false;
  let activeNodes = [];
  let activeEdges = [];

  let force = d3.layout.force()
    .charge(cgOptions.layout.charge)
    .friction(cgOptions.layout.friction)
    .gravity(cgOptions.layout.gravity)
    .linkStrength(function (d) { return d.value * cgOptions.layout.linkStrength; })
    .linkDistance(function (d) { /*return cgOptions.layout.distScale(d.value); */ return 40; })
    .on('tick', updatePosition)
    .on('end', forceDone);

  let nodesRange = [0, 1],
      edgesRange = [0.7, 1];

  let nodesSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      nodesRange = r;
      render(cgOptions.canvas.fastDuration);
      //updateEdgesSelector();
    });

  let edgesSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select',  r => { edgesRange = r; render(cgOptions.canvas.fastDuration); });



  postal.subscribe({channel: 'global', topic: 'render', callback: update});

  /* nodes behavior */
  function onNodeDragStart(d, mx, my) {
    d.fixed |= 2;
    offsetX = d3.event.sourceEvent.layerX - x(d.x);
    offsetY = d3.event.sourceEvent.layerY - y(d.y);
  }

  function onNodeDrag(d) {
    console.log('on drag');
    d3.select(this).classed("fixed", d.fixed |= 3);
    d.x = d.px = x.invert(d3.event.sourceEvent.layerX-offsetX);
    d.y = d.py = y.invert(d3.event.sourceEvent.layerY-offsetY);
    d3.select(this).attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    });
    d3Links.call(edgeRenderer.update);
  }

  function onNodeDragEnd(d) {
    d.fixed &= ~6;
  }

  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }

  /* zoom behavior*/
  let zoom;

  function disableZoom() {
    overlay
      .on('mousedown.zoom', null)
      .on('wheel.zoom', null);
  }
  function enableZoom() { overlay.call(zoom); }

  function onZoom() {
    console.log('onZoom');
    d3Nodes.attr('transform', function(d) {
      console.log('zoom: ',d,x(d.x), y(d.y));
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });
    d3Links.call(edgeRenderer.update)
  }


  function update() {
    force.stop();

    let prev = new Map();
    for (let node of graph.nodes()) {
      prev.set(node.id, node);
    }

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
    layout(cgOptions.layout.initIterations);
  }


  function layout(iter) {
    force
      .nodes(graph.nodes())
      .links(graph.edges())
      .start();
  }

  function clamp(v, min, max) {
    return v < min ? min :
           v > max ? max :
           v;
  }

  function updatePosition() {
    if (cgOptions.layout.clampToWindow) {
      for (let node of activeNodes) {
        node.x = clamp(node.x,  0, width - node.w);
        node.y = clamp(node.y,  0, height - node.h);
      }
    }

    // x(), y() to account for zoom
    d3Nodes.attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });

    d3Links.call(edgeRenderer.update);

    // early termination
    var max = 0, sum = 0, zero = 0, one=0;
    for (let node of activeNodes) {
      let dx = Math.abs(node.x -node.px);
      let dy = Math.abs(node.y - node.py);
      let speed = Math.sqrt(dx*dx + dy+dy);
      max = Math.max(speed,  max);
      sum += speed;
      if (speed == 0) zero++;
      if (speed < 1) one++;
    }

    //var max = _.reduce(activeNodes,  function(max, node) {
    //  return Math.max(max,  Math.abs(node.x - node.px));
    //}, 0);

    //console.log('speed  n:',activeNodes.length,' max:', max,  ' avg:',sum/activeNodes.length, 'zero:', zero,  '<1:', one);
    if (max < cgOptions.layout.minSpeed) {
      force.stop();
    }
  }

  function forceDone() {
    console.log('force done');
  }

  function render(duration) {
    d3Nodes = svgNodes.selectAll('.node')
      .data(graph.nodes(), d => d.id);

    let e = nodeRenderer(d3Nodes.enter());
    e.each(function(d) { console.log('f', d);})
      .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; })
      .call(drag);

    d3Nodes
      .transition()
        .duration(duration)
        .style('opacity', 1)
        .call(nodeRenderer.scale);

    d3Nodes.exit()
      .transition().duration(duration)
        .style('opacity', 1e-6)
        .remove();


    d3Links = svgLinks.selectAll('.link')
      .data(graph.edges(), d => d.id);

    d3Links.enter()
      .call(edgeRenderer);

    d3Links
      .call(edgeRenderer.update);

    d3Links.exit()
      .transition()
        .duration(duration)
        .style('opacity', 1e-6)
        .remove();
  }


  function build(selection) {
    svg = selection
      .append('svg')
      .attr('class', 'cg');

    let g = svg.append('g');

    overlay = g.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', Math.max(0, height - edgesSelector.height() -10));

    /* selectors */
    let sg = g.append('g')
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


    /* graph */
    svgLinks = g.append('g').attr('class', 'links');
    svgNodes = g.append('g').attr('class', 'nodes');

    /* behavior */
    zoom = d3.behavior.zoom().x(x).y(y).scaleExtent([.5, 20]).on("zoom", onZoom);
    overlay.call(zoom);

    addListeners();

    return g;
  }

  function addListeners() {
  }

  let cg = function(selection) {
    build(selection);
    return cg;
  };

  cg.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    x.domain([0, width]).range([0, width]);
    zoom = d3.behavior.zoom().x(x).y(y).scaleExtent([.5, 8]).on("zoom", onZoom);
    svg.attr('width', width);
    overlay
      .attr('width', width)
      .call(zoom);

    return this;
  };

  cg.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    y.domain([0, height]).range([0, height]);
    zoom = d3.behavior.zoom().x(x).y(y).scaleExtent([.5, 8]).on("zoom", onZoom);

    let h = Math.max(0, height - edgesSelector.height() -10);
    svg.attr('height', height);
    svg.select('.cgSelectors')
      .attr('transform', 'translate(10,'+h+')');

    overlay
      .attr('height', h)
      .call(zoom);

    return this;
  };

  cg.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    group = dimension.group().reduce(
      (p,v) => { p.push(v); return p; },
      (p,v) => { p.splice(p.indexOf(v), 1); return p; },
      () => []);
    return this;
  };

  cg.resize = function(size) {
    cg.width(size[0]).height(size[1]);
    // todo: render
  };


  return cg;
}