/**
 * Created by yarden on 6/29/16.
 */
import * as d3 from 'd3';
import postal from 'postal';
import {panel} from 'cg-core';

import Graph from './model/graph';
import colorScheme from './utils/colorscheme';
import {topicsMap} from './service';
import * as tagSelection from './model/tag_selection';
import patients from './model/patients';
import Selector from './components/selector';

let nodesRange = [0.2, 1],
  edgesRange = [0.7, 1];

let format = d3.format(',d');

let view;
let group;
let graph = Graph();
let activeGraph;

let cache = new Map();
let nodeSelector, edgeSelector;

export function init(_) {
  group = _;

  postal.subscribe({channel: 'global', topic: 'render', callback: updateGraph});
  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'detector', topic: 'changed', callback: detectorChanged});

  view = panel()
    .on('select', select)
    .on('exclude', exclude)
    .on('highlight', highlight);

  d3.select('#cg-area').call(view);

  nodeSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      nodesRange = r;
      if (activeGraph) {
        let vg = visibleGraph(activeGraph);
        view.graph(vg);
        updateEdgeSelector();
      }
    });

  edgeSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select', r => {
      edgesRange = r;
      if (activeGraph)
       view.graph(visibleGraph(activeGraph));
    });

  d3.select('#topics-chart')
    .append('g')
    .attr('class', 'nodeSelector')
    .call(nodeSelector);

  d3.select('#relations-chart')
    .append('g')
    .attr('class', 'edgeSelector')
    .call(edgeSelector);
  
  d3.select('#show-relations')
    .on('change', function() {
      view.showEdges(this.checked);
    });

  d3.select('#edgeMeasure')
    .on('change', function() {
      graph.edgeMeasure(this.value);
      update();
    })
    .selectAll('.option')
      .data(Object.keys(graph.measures.edge))
      .enter()
      .append('option')
      .text(function(d) { return d;})
      .property('value', function(d) { return d;});

  
  d3.select('#color')
    .on('change', function() {
      colorScheme.current = this.value;
      for (let node of graph.nodes()) {
        node.color = colorScheme.color(node.topic);
      }
      view.update();
      postal.publish({channel: 'global', topic: 'color.change'});
    });
  
  window.ResizeSensor(d3.select('#cg-area').node(), () => {
    console.log('cg-area resized');
    let node = d3.select('#cg-area').node();
    view.resize(node.offsetWidth, node.offsetHeight);
  });
}

function updateEdgeSelector() {
  edgeSelector.data(activeGraph.links.reduce((p,c) => {
    if (c.source.visible && c.target.visible) p.push(c.value);
    return p;
  }, []));
}

function visibleGraph(graph) {
  let nodes = [];
  for (let node of graph.nodes) {
    node.visible = node.excluded || (node.scale >= nodesRange[0] && node.scale <= nodesRange[1]);
    if (node.visible) nodes.push(node);
  }

  let links = graph.links.filter(e => e.source.visible && e.target.visible
    && e.value >= edgesRange[0] && e.value <= edgesRange[1]);
  return {nodes: nodes, links: links};
}

function updateGraph() {
  graph.nodes(group.all()
    .filter(item =>
    item.value.size > 0 || tagSelection.isExcluded(item.key))
    .map(item => {
      let topic = topicsMap.get(item.key);
      let node = cache.get(topic.id);
      if (!node) {
        node = {
          id: item.key,
          label: topic.label,
          topic: topic,
          scale: 1
        };
        cache.set(topic.id, node);
      }

      node.color = colorScheme.color(node.topic);

      //node.items = item.value.map(entry => entry.enc_id);
      node.items = [];
      for (let entry of item.value) {
        node.items.push(entry.enc_id);
      }
      node.items.sort((a, b) => a - b);

      node.selected = tagSelection.isSelected(node.id);

      let prev = node.excluded;
      node.excluded = tagSelection.isExcluded(node.id);
      if (node.excluded && !prev) node.lastScale = node.scale;

      return node;
    })
  );

  update();
}

function update() {
  activeGraph = {nodes:graph.nodes(), links:graph.edges()};
  nodeSelector.data(activeGraph.nodes.reduce( (p, c) => { p.push(c.scale); return p;}, []));

  let vg = visibleGraph(activeGraph);
  updateEdgeSelector();

  view.graph(vg);

  console.log('active encounters', patients.numActiveEncounters);
  d3.select("#encounters").text(format(patients.numActiveEncounters));
  d3.select("#topics").text(`${format(vg.nodes.length)} of ${format(activeGraph.nodes.length)}`);
  d3.select("#relations").text(`${format(vg.links.length)} of ${format(activeGraph.links.length)}`);

}

function dataChanged() {
  updateGraph();
}

function detectorChanged(prob) {
  let map = null;
  if (prob) {
    map = new Map();
    for(let entry of prob.top(Infinity))
      map.set(entry.id, entry.prob);
  }
  graph.prob(map);
  postal.publish({channel: 'global', topic: 'render'});
}

function select(d) {
  // console.log('select', d);
  tagSelection.select(d.topic.id);
}

function exclude(d) {
  // console.log('exclude', d);
  tagSelection.exclude(d.topic.id);
}

function highlight(d) {
  // console.log('highlight', d);
}