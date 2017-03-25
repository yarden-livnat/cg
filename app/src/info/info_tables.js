/**
 * Created by yarden on 8/21/15.
 */

import * as d3 from 'd3';
import postal from 'postal'

import colorScheme from '../utils/colorscheme';
import patients from '../model/patients';
import {topicsMap} from '../service';
import * as tagSelection from '../model/tag_selection';

import table from '../components/table';
import bar from '../components/bar';

let selected;
let excluded;

let container = d3.select('#details-tables');

let cat = Table(container)
  .id('cat-table')
  .header([
    {name: 'key', title: 'Category'},
    {name: 'value', title: '#tags', attr:'numeric'}])
    .dimension(patients.topics_cat)
  .color(colorScheme.scheme( colorScheme.current == 'category' ? 'category' : 'none'))
  .on('change', filter);

let sys = Table(container)
  .id('sys-table')
  .header([
    {name: 'key', title: 'System'},
    {name: 'value', title: '#tags', attr:'numeric'}])
  .dimension(patients.topics_sys)
  .color(colorScheme.scheme( colorScheme.current == 'system' ? 'system' : 'none'))
  .on('change', filter);

let bars = bar();

let tags = RelTable(container)
  .id('tags-table')
  .header([
    {name: 'topic', title: 'Findings', cellAttr: r => r.attr && r.attr.name},
    {name: 'value', title: 'Encounters', render: bars}])
  .in_dimension(patients.rel_tid);
  //.out_dimension(patients.enc_tags);
  //.on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
  //.on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); })


postal.subscribe({channel: 'global', topic: 'render', callback: render});
postal.subscribe({channel: 'global', topic: 'color.change', callback: updateColors});


function updateColors() {
  cat.color(colorScheme.scheme( colorScheme.current == 'category' ? 'category' : 'none')).render();
  sys.color(colorScheme.scheme( colorScheme.current == 'system' ? 'system' : 'none')).render();
}

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

function filter() {
  selected = new Set();
  excluded = new Set();

  collect('category', cat.selected(), selected);
  collect('category', cat.excluded(), excluded);
  collect('system', sys.selected(), selected);
  collect('system', sys.excluded(), excluded);

  if (selected.size == 0 && excluded.size == 0)
    patients.rel_tid_topic.filterAll();
  else {
    let active = activeEncounters();
    patients.rel_tid_topic.filter(eid => active.has(eid));
  }

  patients.update(patients.rel_tid_topic);
  postal.publish({channel: 'global', topic: 'render'});

}

function collect(field, from, to) {
  if (from.size == 0) return;
  for (let topic of patients.topics) {
    if (from.has(topic[field])) to.add(topic.id);
  }
}

function activeEncounters() {
  let active = new Set();
  for (let enc of patients.encountersMap.values())
    if (accept(enc)) active.add(enc.id);
  return active;
}

function accept(enc) {
  let select = selected.size == 0;
  for (let tid of enc.tags) {
    if (excluded.has(tid)) return false;
    select = select || selected.has(tid);
  }
  return select;
}

function Table(div) {
  let selected = new Set();
  let excluded = new Set();
  let dimension;
  let group;
  let color = () => 'black';
  let event = d3.dispatch('change');

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

      event.call('change', this, selected, excluded);
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

  api.dimension = function(d) {
    dimension = d;
    if (group) group.dispose();
    group = dimension.group();
    return this;
  };

  api.render = function() {
    let values = group.all();
    values.forEach( v => v.color = color(v.key));
    inner.data(values);
    return this;
  };

  api.color = function(_) {
    color = _;
    return this;
  };

  api.on = function(type, listener) {
    event.on(type, listener);
    return this;
  };

  api.selected = function() { return selected; };

  api.excluded = function() { return excluded; };

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