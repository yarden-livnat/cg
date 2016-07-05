/**
 * Created by yarden on 6/29/16.
 */
import * as d3 from 'd3';
import postal from 'postal';
import {panel} from 'cg-core';

import Graph from './model/graph';
import * as utils from './utils/utils';
import {cgOptions} from './config';
import {topicsMap} from './service';
import * as tagSelection from './tag_selection';
import * as patients from './patients';
import Selector from './components/selector';

let nodesRange = [0.2, 1],
  edgesRange = [0.7, 1];


let view;
let group;
let graph = Graph();
let activeGraph;

let cache = new Map();
let nodesSelector, edgesSelector;

export function init(_) {
  group = _;

  postal.subscribe({channel: 'global', topic: 'render', callback: update});
  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'detector', topic: 'changed', callback: detectorChanged});

  view = panel()
    .on('select', select)
    .on('exclude', exclude)
    .on('highlight', highlight);

  d3.select('#cg-area').call(view);

  nodesSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      nodesRange = r;
      let vg = visibleGraph();
      view.graph(vg);
      edgesSelector.data(vg.edges);
    });

  edgesSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select', r => {
      edgesRange = r;
      view.graph(visibleGraph());
    });

  d3.select('#topics-chart')
    .append('g')
    .attr('class', 'nodesSelector')
    .call(nodesSelector);

  d3.select('#relations-chart')
    .append('g')
    .attr('class', 'edgesSelector')
    .call(edgesSelector);
  
  d3.select('#show-relations')
    .on('change', function() {
      view.showEdges(this.checked);
    });
  
  window.ResizeSensor(d3.select('#cg-area').node(), () => {
    console.log('cg-area resized');
    let node = d3.select('#cg-area').node();
    view.resize(node.offsetWidth, node.offsetHeight);
  });
}

function visibleGraph(graph) {
  let nodes = [];
  for (let node of graph.nodes) {
    node.visible = node.excluded || (node.scale >= nodesRange[0] && node.scale <= nodesRange[1]);
    if (node.visible) nodes.push(node);
  }

  let links = graph.links.filter(e => e.source.visible && e.target.visible);
  return {nodes: nodes, links: links};
}

function update() {
  graph.nodes(group.all()
    .filter( item => item.value.size > 0 || tagSelection.isExcluded(item.key))
    .map(item => {
      let topic = topicsMap.get(item.key);
      let node = cache.get(topic.id);
      if (!node) {
        node = {
          id:    item.key,
          label: topic.label,
          topic: topic,
          scale: 1
        };
        cache.set(topic.id, node);
      }

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

  activeGraph = {nodes:graph.nodes(), links:graph.edges()};
  nodesSelector.data(activeGraph.nodes.reduce( (p, c) => { p.push(c.scale); return p;}, []));

  let vg = visibleGraph(activeGraph);
  edgesSelector.data(vg.links.reduce((p,c) => { p.push(c.value); return p;}, []));

  view.graph(vg);
}

function dataChanged() {
  update();
}

function detectorChanged() {

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