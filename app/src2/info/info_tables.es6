/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import postal from 'postal'

import * as patients from '../patients';
import {topicsMap} from '../service';
import * as tagSelection from '../tag_selection';

import table from '../components/table';
import bar from '../components/bar';

let container = d3.select('#details-tables');

let cat = Table(container)
    .id('cat-table')
    .header([
      {name: 'key', title: 'Category'},
      {name: 'value', title: '#tags', attr:'numeric'}])
    .dimension(patients.topics_cat);

let sys = Table(container)
    .id('sys-table')
    .header([
      {name: 'key', title: 'System'},
      {name: 'value', title: '#tags', attr:'numeric'}])
    .dimension(patients.topics_sys);

let bars = bar();
let tags = RelTable(container)
  .id('tags-table')
  .header([
    {name: 'topic', title: 'Topic', cellAttr: r => r.attr && r.attr.name},
    {name: 'value', title: 'Encounters', render: bars}])
  .in_dimension(patients.rel_tid);
  //.out_dimension(patients.enc_tags);
  //.on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
  //.on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); })


postal.subscribe({channel: 'global', topic: 'render', callback: render});

export function init() {
  //for (let topic of topics) topicsMap.set(topic.id, topic.label);
}

function reset() {
}

function render() {
  cat.render();
  sys.render();
  tags.render();
}

function Table(div) {
  let selected = new Set();
  let excluded = new Set();
  let dimension;
  let group;

  let inner = table(div)
    .on('click',  function click(d) {
      if (d3.event.metaKey) {
        if (!excluded.delete(d.value)) excluded.add(d.value);
        selected.delete(d.value);
      } else {
        if (!selected.delete(d.value)) selected.add(d.value);
        excluded.delete(d.value);
      }

      d.row.classes = { selected: selected.has(d.value), excluded: excluded.has(d.value)};

      if (selected.size == 0 && excluded.size == 0)
        dimension.filterAll();
      else
        dimension.filter( v => (selected.size == 0 || selected.has(v)) && (excluded.size == 0 || !excluded.has(v)) );

      patients.update(dimension);
      postal.publish({channel: 'global', topic: 'render'});
    });

  function api(selection) {
    return this;
  }

  api.id = function(_) {
    inner.id(_);
    return this;
  };

  api.header = function(_) {
    inner.header(_);
    return this;
  };

  api.dimension = function(_) {
    dimension = _;
    if (group) group.dispose();
    group = dimension.group();
    return this;
  };

  api.render = function() {
    inner.data(group.all());
    return this;
  };

  return api;
}

function RelTable(div) {
  let in_dimension;
  let in_group;
  let out_dimension;

  let inner = table(div)
    .on('click',  function click(d) {
      let key = d.row.key.tid;

      if (d3.event.metaKey) tagSelection.exclude(key);
      else  tagSelection.select(key);
    });

  function api(selection) {
    return this;
  }

  api.id = function(_) {
    inner.id(_);
    return this;
  };

  api.header = function(_) {
    inner.header(_);
    return this;
  };

  api.in_dimension = function(_) {
    in_dimension = _;
    if (in_group) in_group.dispose();
    in_group = in_dimension.group();
    return this;
  };

  api.out_dimension = function(_) {
    out_dimension = _;
    return this;
  };

  api.render = function() {
    let items = in_group.all();
    let max = 0;
    for (let item of items) {
      item.topic = topicsMap.get(item.key.tid).label;
      item.classes = {
        'selected': tagSelection.isSelected(item.key.tid),
        'excluded': tagSelection.isExcluded(item.key.tid)
      };
      max = Math.max(max, item.value);
    }
    bars.max(max);
    inner.data( items );
    return this;
  };

  return api;
}