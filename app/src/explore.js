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


let view;
let group;
let graph = Graph();
let cache = new Map();


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

  window.ResizeSensor(d3.select('#cg-area').node(), () => {
    let node = d3.select('#cg-area').node();
    view.resize(node.offsetWidth, node.offsetHeight);
  });
}

function update() {
  graph.nodes(group.all().map(item => {
    let topic = topicsMap.get(item.key);
    let node = cache.get(topic.id);
    if (!node) {
      node = {
        id:    item.key,
        label: topic.label,
        topic: topic,
        // x:     Math.random() * width,
        // y:     Math.random() * height,
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
  }));

  view.graph({nodes:graph.nodes(), links:graph.edges()});
}

function dataChanged() {
  update();
}

function detectorChanged() {

}

function select(d) {
  console.log('select', d);
}

function exclude(d) {
  console.log('exclude', d);
}

function highlight(d) {
  console.log('highlight', d);
}