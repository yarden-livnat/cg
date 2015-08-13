/**
 * Created by yarden on 7/21/15.
 */

import d3 from 'd3';
import postal from 'postal';

import * as data from '../data';
import table from '../components/table';
import bar from '../components/bar';

export default function(opt) {
  let post = postal.channel('events');
  let selection;
  let bars = bar();

  let catFilter = GroupFilter('category');
  let sysFilter = GroupFilter('system');

  let tagsTable = table('#details-tables', 'tags-table').header([
    {name: 'name', title: 'Concept', cellAttr: r => r.attr && r.attr.name},
    {name: 'encounters', render: bars}
  ]).on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
    .on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); })
    .on('click', function(d) {
      if (d3.event.shiftKey) selection.exclude(d.row.tag);
      else selection.select(d.row.tag);
    });

  let catTable = table('#details-tables', 'cat-table').header([
    {name: 'category'},
    {name: 'n', title: '#tags', attr:'numeric'}
  ]).on('click', function(d) {
    catFilter.change(d.value);
  });

  let sysTable = table('#details-tables', 'sys-table').header([
    {name: 'system'},
    {name: 'n', title: '#tags', attr:'numeric'}
  ]).on('click', function(d) {
      sysFilter.change(d.value);
    });

  function init() {
    postal.subscribe({channel: 'data', topic: 'changed', callback: dataChanged});
  }

  function dataChanged() {
    let entry;

    bars.max(d3.max(data.selected, d => d.items.length));
    tagsTable.data(data.selected.map(tag => {
      return {
        name: tag.concept.label,
        encounters: tag.items.length,
        tag: tag,
        attr: {}
      }
    }));

    // categories
    let cat = new Map();
    for (let tag of data.selected) {
      let n = cat.get(tag.concept.category) || 0;
      cat.set(tag.concept.category, n+1);
    }
    let categories = [];
    for (entry of cat.entries()) {
      categories.push({category: entry[0], n: entry[1]});
    }
    catTable.data(categories);

    //systems
    let sys = new Map();
    for (let tag of data.selected) {
      let n = sys.get(tag.concept.system) || 0;
      sys.set(tag.concept.system, n+1);
    }
    let systems = [];
    for (entry of sys.entries()) {
      systems.push({system: entry[0], n: entry[1]});
    }
    sysTable.data(systems);

    selectionChanged();
  }

  function selectionChanged() {
    updateSelectionList();

    let tag, attr = new Map();

    for (tag of selection.selected()) { attr.set(tag.concept.label, 'selected'); }
    for (tag of selection.excluded()) { attr.set(tag.concept.label, 'excluded'); }

    let rows = tagsTable.data();
    if (rows) {
      let max = 0;
      for(let row of rows) {
        row.attr.name = attr.get(row.name);
        //if (attr.get(row.tag.concept.label) != 'excluded') {
          row.encounters =   selection.countActive(row.tag.items);
          max = Math.max(max, row.encounters);
        //} else {
        //  row.encounters = row.tag.items.length;
      }
      bars.max(max);
      tagsTable.data(rows);
    }

    let entry;
    let categories = new Map();
    let systems = new Map();
    for (tag of data.selected) {
      if (selection.countActive(tag.items) > 0) {
        let c = categories.get(tag.concept.category) || 0;
        categories.set(tag.concept.category, c+1);
        let s = systems.get(tag.concept.system) || 0;
        systems.set(tag.concept.system, s+1);
      }
    }

    let cat = [];
    for (entry of categories.entries()) {
      cat.push({category: entry[0], n: entry[1]});
    }
    catTable.data(cat);


    let sys = [];
    for (entry of systems.entries()) {
      sys.push({system: entry[0], n: entry[1]});
    }
    sysTable.data(sys);
  }

  function updateSelectionList() {
    let tag, list = [];
    for (tag of selection.selected()) {
      list.push({name: tag.concept.label, attr: 'selected'});
    }
    for (tag of selection.excluded()) {
      list.push({name:  tag.concept.label, attr: 'excluded'});
    }

    let s = d3.select('#selection-list').selectAll('li')
      .data(list);

    s.enter().append('li');
    s.text(d => d.name).attr('class', d => d.attr);
    s.exit().remove();
  }

  function GroupFilter(field) {
    let dispatch = d3.dispatch('change');
    let group = new Set();

    let f = function(tag) {
      return group.size == 0 || group.has(tag.concept[field]);
    };

    f.add = function(item) {
      group.add(item);
      dispatch.change();
    };

    f.remove = function(item) {
      if (group.delete(item))
        dispatch.change();
    };

    f.change = function(item) {
      if (!group.delete(item))
        group.add(item);
      dispatch.change();
    };

    f.on = function(type, cb) {
      dispatch.on(type, cb);
    };

    return f;
  }

  return {
    init() {
      init();
      return this;
    },

    selection(s) {
      selection = s;
      selection.addTagsFilter(catFilter, 'category', true);
      selection.addTagsFilter(sysFilter, 'system', true);
      selection.on('changed.info.tables', selectionChanged);
      return this;
    },

    resize() {
      return this;
    }
  };
}