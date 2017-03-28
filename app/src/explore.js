/**
 * Created by yarden on 6/29/16.
 */
import * as d3 from 'd3';
import postal from 'postal';
import Lockr from 'lockr';
import {panel} from 'cg-core';

import {measures as edgeMeasures, apply_measure} from './model/measures';
import Graph from './model/graph';
import colorScheme from './utils/colorscheme';
import {topicsMap} from './service';
import * as tagSelection from './model/tag_selection';
import patients from './model/patients';
import Selector from './components/selector';

let nodesMeasureName = Lockr.get('explore.nodesMeasure','category');
let edgesMeasureName = Lockr.get('explore.edgesMeasure', 'cosine');
let nodesRange = Lockr.get('explore.nodesRange', [0.2, 1]);
let edgesRange = Lockr.get('explore.edgesRange', [0.7, 1]);
let supportRange = Lockr.get('explore.supportRange', [0, 1]);

let currentMeasure;

let format = d3.format(',d');
let scale_fmt = d3.format('3.1f');

let view;
let group;
let graph = Graph();
let activeGraph;
let visibleGraph;

let cache = new Map();
let nodeSelector, edgeSelector, supportSelector;

export function init(_) {
  group = _;
  colorScheme.current = Lockr.get('explore.colorScheme', colorScheme.current);

  postal.subscribe({channel: 'global', topic: 'render', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'detector', topic: 'changed', callback: detectorChanged});

  view = panel()
    .on('select', select)
    .on('exclude', exclude)
    .on('highlight', highlight)
    .on('highlight_link', highlight_link);

  d3.select('#cg-area').call(view);

  nodeSelector = Selector()
    .width(100).height(50)
    .select(nodesRange)
    .on('select', r => {
      Lockr.set('explore.nodesRange', r);
      nodesRange = r;
      if (activeGraph) {
        update_nodes();
        show();
      }
    });

  edgeSelector = Selector()
    .width(100).height(50)
    .select(edgesRange)
    .on('select', r => {
      Lockr.set('explore.edgesRange', r);
      edgesRange = r;
      if (activeGraph) {
        update_links();
        update_support();
        show();
      }
    });

  supportSelector = Selector()
    .width(100).height(50)
    .select(supportRange)
    .on('select', r => {
      Lockr.set('explore.supportRange', r);
      supportRange = r;
      if (activeGraph) {
        update_links();
        update_edges();
        show();
      }
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
    .property('checked', Lockr.get('explore.showRelations', false))
    .on('change', function() {
      view.showEdges(this.checked);
      Lockr.set('explore.showRelations', this.checked);
    });
  view.showEdges(Lockr.get('explore.showRelations', false));

  d3.select('#support-chart')
    .append('g')
    .attr('class', 'supportSelector')
    .call(supportSelector);

  d3.select('#nodeMeasure')
    .on('change', function() {
      Lockr.set('explore.nodesMeasure', this.value);
      graph.nodeMeasure(this.value);
      update();
      show();
    })
    .selectAll('.option')
      .data(Object.keys(graph.measures.node))
      .enter()
        .append('option')
        .text(function(d) { return d;})
        .property('value', function(d) { return d;})
        .property('selected', d => d == nodesMeasureName);
  graph.nodeMeasure(nodesMeasureName);


  d3.select('#edgeMeasure')
    .on('change', function() {
      Lockr.set('explore.edgesMeasure', this.value);
      currentMeasure = edgeMeasures.find( m => m.name == this.value);
      graph.edgeMeasure(apply_measure(currentMeasure));
      edgeSelector.xdomain(currentMeasure.range, currentMeasure.ind);
      update();
      show();
    })
    .selectAll('.option')
      .data(edgeMeasures)
      .enter()
        .append('option')
        .text(function(d) { return d.name;})
        .property('value', function(d) { return d.name;})
        .property('selected', d => d.name == edgesMeasureName);

  currentMeasure = (edgeMeasures.find(d => d.name == edgesMeasureName) || edgeMeasures[0]);
  graph.edgeMeasure(apply_measure(currentMeasure));

  edgeSelector
    // .ignore(currentMeasure.ind)
    .xdomain(currentMeasure.range);

  d3.select('#color')
    .on('change', function() {
      Lockr.set('explore.colorScheme', this.value);
      colorScheme.current = this.value;
      for (let node of graph.nodes()) {
        node.color = colorScheme.color(node.topic);
      }
      view.update();
      postal.publish({channel: 'global', topic: 'color.change'});
    })
    .selectAll('.option').data(Array.from(colorScheme.schemes()))
      .enter().append('option')
        .text( d => d )
        .property('value', d => d)
        .property('selected', d => d == colorScheme.current);
  
  window.ResizeSensor(d3.select('#cg-area').node(), () => {
    console.log('cg-area resized');
    let node = d3.select('#cg-area').node();
    view.resize(node.offsetWidth, node.offsetHeight);
  });


  let v = -Lockr.get('explore.charge', view.charge());
  view.charge(v);
  d3.select('#charge')
    .property('value', v)
    .on('change', function() { console.log('charge:', this.value); Lockr.set('explore.charge', +this.value); view.charge(-this.value);} );

  v = Lockr.get('explore.min_dist', view.charge_mindist());
  view.charge_mindist(v);
  d3.select('#min_dist')
    .property('value', v)
    .on('change', function() { console.log('min dist:', this.value); Lockr.set('explore.min_dist', +this.value);view.charge_mindist(+this.value);} );

  v = Lockr.get('explore.max_dist', view.charge_maxdist());
  view.charge_maxdist(v);
  d3.select('#max_dist')
    .property('value', v)
    .on('change', function() { console.log('max dist:', this.value); Lockr.set('explore.max_dist', +this.value);view.charge_maxdist(+this.value);} );

  v = Lockr.get('explore.d1', view.link_d1());
  view.link_d1(v);
  d3.select('#link_d1')
    .property('value', v)
    .on('change', function() { console.log('d1:', this.value); Lockr.set('explore.d1', +this.value);view.link_d1(+this.value);} );

  v = Lockr.get('explore.d0', view.link_d0());
  view.link_d0(v);
  d3.select('#link_d0')
    .property('value', v)
    .on('change', function() { console.log('d0:', this.value); Lockr.set('explore.d0', +this.value);view.link_d0(+this.value);} );

  v = Lockr.get('explore.factor', view.linkFactor());
  view.linkFactor(v);
  d3.select('#factor')
    .property('value', v)
    .on('change', function() { console.log('factor:', this.value); Lockr.set('explore.factor', +this.value);view.linkFactor(+this.value);} );
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

      node.items = [];
      for (let entry of item.value) {
        node.items.push(entry.enc_id);
      }
      node.items.sort((a, b) => a - b);

      node.selected = tagSelection.isSelected(node.id);

      let prev = node.excluded;
      node.excluded = tagSelection.isExcluded(node.id);
      if (node.excluded) {
        if (!prev) node.lastScale = node.scale;
        else node.scale = node.lastScale;
      }

      return node;
    })
  );

}

function show() {
  view.graph(visibleGraph);

  d3.select("#encounters").text(format(patients.numActiveEncounters));
  d3.select("#topics").text(`${format(visibleGraph.nodes.length)} of ${format(activeGraph.nodes.length)}`);
  d3.select("#relations").text(`${format(visibleGraph.links.length)} of ${format(activeGraph.links.length)}`);
}

function update() {
  activeGraph = {nodes:graph.nodes(), links:graph.edges()};
  let scales = activeGraph.nodes.reduce( (p, c) => { p.push(c.scale); return p;}, []);
  nodeSelector.data(scales);
  update_nodes();
}

function update_nodes() {
  let nodes = [];
  for (let node of activeGraph.nodes) {
    node.visible = node.excluded || node.selected || (node.scale >= nodesRange[0] && node.scale <= nodesRange[1]);
    if (node.visible) nodes.push(node);
  }

  visibleGraph = {nodes: nodes, links: activeGraph.links};

  update_links();

  update_edges();
  update_support();
}


function update_edges() {
  let scales = [];
  for (let link of activeGraph.links) {
    if (link.source.visible && link.target.visible
        && (currentMeasure.type == 'correlation' ||
           // (supportRange[0] <= link.support && link.support <= supportRange[1]))
      (supportRange[0] <= link.cross_support && link.cross_support <= supportRange[1]))) {
      scales.push(link.r);
    }
  }
  edgeSelector.data(scales);
}

function update_support() {
  let support = [];
  for (let link of activeGraph.links) {
    if (link.source.visible && link.target.visible
         && edgesRange[0] <= link.r && link.r <= edgesRange[1]) {
      support.push(link.cross_support); //link.support);
    }
  }
  supportSelector.data(support);
}

function update_links() {
  let links = [];
  for (let link of activeGraph.links) {
    link.visible = link.source.visible && link.target.visible
      // && supportRange[0] <= link.support && link.support <= supportRange[1]
      && supportRange[0] <= link.cross_support && link.cross_support <= supportRange[1]
      && edgesRange[0] <= link.r && link.r <= edgesRange[1];
    if (link.visible) {
      links.push(link);
    }
  }

  visibleGraph.links = links;
}


function dataChanged() {
  updateGraph();
  update();
  show();
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
  tagSelection.select(d.topic.id);
}

function exclude(d) {
  tagSelection.exclude(d.topic.id);
}

function highlight(node, on) {
  d3.select('#highlight')
    .text(on ? `${node.label}: findings:${node.items.length}  importance: ${scale_fmt(node.scale)} ` : '');
}

function highlight_link(link, on) {
  d3.select('#highlight')
    .text( on ? `${scale_fmt(link.r)}: [${link.source.label}: ${link.source.items.length}]   [${link.target.label}: ${link.source.items.length}]` : '');
}