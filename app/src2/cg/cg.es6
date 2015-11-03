/**
 * Created by yarden on 8/24/15.
 */

import d3 from 'd3';
import postal from 'postal'

import {cgOptions} from '../config';
import {topicsMap} from '../service';
import * as tagSelection from '../tag_selection';


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
    .linkDistance(function (d) { /*return cgOptions.layout.distScale(d.value); */ return 40;}
  )
    .on('tick', updatePosition)
    .on('end', forceDone);

  /*
   * Nodes and Edge Selectors
   */

  let nodesRange = [0, 1],
      edgesRange = [0.7, 1];

  let nodesSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      nodesRange = r;
      render(cgOptions.canvas.fastDuration);
      updateEdgesSelector();
    }
  );

  let edgesSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select', r => {
      edgesRange = r;
      render(cgOptions.canvas.fastDuration);
    }
  );


  function updateNodesSelector() {
    let values = [];
    for(let node of graph.nodes()) {
      if (node.items.length > 0) values.push(node.scale);
    }
    nodesSelector.data(values);
  }

  function updateEdgesSelector() {
    let active = [];
    for(let edge of graph.edges()) {
      if (edge.source.visible && edge.target.visible) active.push(edge.value);
    }
    edgesSelector.data(active);
  }

  // Cache
  let cache = new Map();

  postal.subscribe({channel: 'global', topic: 'render', callback: update});
  postal.subscribe({channel: 'global', topic: 'data.changed', callback: onDataChanged});
  postal.subscribe({channel: 'detector', topic: 'changed', callback: detectorChanged});

  function detectorChanged(prob) {
    let map = null;
    if (prob) {
      map = new Map();
      for(let entry of prob.top(Infinity))
        map.set(entry.id, entry.prob);
    }
    graph.prob(map);
    postal.publish({channel: 'global', topic: 'render'});  }

  /* nodes behavior */
  function onNodeDragStart(d, mx, my) {
    d.fixed |= 2;
    offsetX = d3.event.sourceEvent.layerX - x(d.x);
    offsetY = d3.event.sourceEvent.layerY - y(d.y);
  }

  function onNodeDrag(d) {
    console.log('on drag');
    d3.select(this).classed("fixed", d.fixed |= 3);
    d.x = d.px = x.invert(d3.event.sourceEvent.layerX - offsetX);
    d.y = d.py = y.invert(d3.event.sourceEvent.layerY - offsetY);
    d3.select(this).attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    }
    );
    d3Links.call(edgeRenderer.update);
  }

  function onNodeDragEnd(d) {
    d.fixed &= ~6;
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
    d3Nodes.attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });
    d3Links.call(edgeRenderer.update);
  }


  function getNode(item) {

    return node;
  }


  /*
   * process new data
   */
  function update() {
    force.stop();

    graph.nodes(group.all().map(item => {
      let topic = topicsMap.get(item.key);
      let node = cache.get(topic);
      if (!node) {
        node = {
          id:    item.key,
          label: topic.label,
          topic: topic,
          x:     Math.random() * width,
          y:     Math.random() * height,
          scale: 1
        };
        cache.set(node.id, node);
      }

      node.items = item.value.map(entry => entry.enc_id);
      node.items.sort((a, b) => a - b);

      node.selected = tagSelection.isSelected(node.id);
      if (tagSelection.isExcluded(node.id)) {
        if (!node.excluded) {
          node.lastScale = node.scale;
          node.excluded = true;
        }
      }

      return node;
    }));

    render(cgOptions.canvas.duration);
    updateNodesSelector();
    updateEdgesSelector();
  }

  function onDataChanged() {
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
      for(let node of activeNodes) {
        node.x = clamp(node.x, 0, width - node.w);
        node.y = clamp(node.y, 0, height - node.h);
      }
    }

    // x(), y() to account for zoom
    d3Nodes.attr('transform', function (d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    }
    );

    d3Links.call(edgeRenderer.update);

    // early termination
    var max = 0, sum = 0, zero = 0, one = 0;
    for(let node of activeNodes) {
      let dx = Math.abs(node.x - node.px);
      let dy = Math.abs(node.y - node.py);
      let speed = Math.sqrt(dx * dx + dy + dy);
      max = Math.max(speed, max);
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
    let t = Date.now();
    let activeNodes = [];
    for(let node of graph.nodes()) {
      if (node.excluded) {
        node.visible = true;
        node.scale = node.lastScale;
      } else {
        node.visible = node.items.length > 0 &&
          node.scale >= nodesRange[0] && node.scale <= nodesRange[1];
      }
      if (node.visible) activeNodes.push(node);
    }

    d3Nodes = svgNodes.selectAll('.node')
      .data(activeNodes, d => d.id);

    let newNodes = nodeRenderer(d3Nodes.enter());
    newNodes
      .attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; })
      .call(node_behavior);


    d3Nodes.select('text')
      .classed('excluded', d => d.excluded);

    d3Nodes
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .call(nodeRenderer.update);

    d3Nodes.exit()
      .transition().duration(duration)
      .style('opacity', 1e-6)
      .remove();


    let activeEdges = showEdges && graph.edges().filter(edge => edge.source.visible && edge.target.visible
      && edge.value >= edgesRange[0] && edge.value <= edgesRange[1]
      )
      || [];

    d3Links = svgLinks.selectAll('.link')
      .data(activeEdges, d => d.id);

    d3Links.enter()
      .call(edgeRenderer);

    d3Links
      .call(edgeRenderer.update);

    d3Links.exit()
      .transition()
      .duration(duration)
      .style('opacity', 1e-6)
      .remove();

    // performance
    console.log('render: ', Date.now() -t, 'msec');
  }

  /* interactions */
  var mouse_time = Date.now();

  function node_behavior(selection) {
    selection.on('mousedown', node_mousedown)
      .on('mouseup', node_mouseup)
      .on("dblclick", node_dblclick)
      .call(drag);
  }

  function node_mousedown(d) {
    mouse_time = Date.now();
    disableZoom();
  }

  function node_mouseup(d) {
    enableZoom();

    var dt = Date.now() - mouse_time;
    if (dt < 200) {
      force.stop();
      //if (d3.event.metaKey)       { d3.select(this).classed("fixed", d.fixed = false); }
      if (d3.event.metaKey) { tagSelection.exclude(d.topic.id); }
      else                  { tagSelection.select(d.topic.id); }
    }
  }

  function node_dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
  }

  /* init */
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
      .on('click', () => { showEdges = !showEdges; render(cgOptions.canvas.fastDuration); });


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
    if (group) group.dispose();
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