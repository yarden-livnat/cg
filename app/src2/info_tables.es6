/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import postal from 'postal'

import * as patients from './patients';
import {topicsMap} from './service';
import * as tagSelection from './tag_selection';

import table from './components/table';
import bar from './components/bar';

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
  .in_dimension(patients.rel_tid)
  .out_dimension(patients.enc_tags);
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
  let dirty = false;
  let inner = table(div)
    .on('click',  function click(d) {
      dirty = true;
      if (selected.delete(d.value)) {
        d3.select(this)
          .classed('selected', false);
      } else {
        d3.select(this)
          .classed('selected', true);
        selected.add(d.value)
      }
      if (selected.size == 0)
        dimension.filterAll();
      else
        dimension.filter( v => selected.has(v) );
      patients.update(dimension);

      // todo: should this be done in patients.update?
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
    return this;
  };

  api.render = function() {
    if (dirty) { dirty = false; }
    else {
      inner.data(dimension.group().top(Infinity));
    }
    return this;
  };

  return api;
}

function RelTable(div) {
  let in_dimension;
  let out_dimension;
  let dirty = false;
  let inner = table(div)
    .on('click',  function click(d) {
      dirty = true;
      let key = d.row.key;

      if (d3.event.metaKey) tagSelection.exclude(key);
      else  tagSelection.select(key);

      d3.select(this)
        .classed('selected', tagSelection.isSelected(key))
        .classed('excluded', tagSelection.isExcluded(key));
    });

  function filter(eid) {
    let enc = patients.encountersMap.get(eid);
    for (let s of selected) if (!enc.tags.has(s)) return false;
    for (let e of excluded) if (enc.tags.has(e)) return false;
    return true;
  }

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
    return this;
  };

  api.out_dimension = function(_) {
    out_dimension = _;
    return this;
  };

  api.render = function() {
    if (dirty) { dirty = false; }
    else {
      let items = in_dimension.group().top(Infinity);
      let max = 0;
      for (let item of items) {
        item.topic = topicsMap.get(item.key).label;
        item.classes = {
          'selected': tagSelection.isSelected(item.key),
          'excluded': tagSelection.isExcluded(item.key)
        };
        max = Math.max(max, item.value);
      }
      bars.max(max);
      inner.data( items );
    }
    return this;
  };

  return api;
}