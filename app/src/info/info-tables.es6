/**
 * Created by yarden on 7/21/15.
 */

import d3 from 'd3';
import postal from 'postal';

import * as data from '../data';
import table from '../components/table';
import bar from '../components/bar';

export default function(opt) {
  let selection;
  let bars = bar();
  let post = postal.channel('events');

  let tagsTable = table('#details-tables', 'tags-table').header([
    {name: 'name', title: 'Concept', cellAttr: r => r.attr && r.attr.name},
    //{name: 'category', title: 'Cat'},
    //{name: 'system', title: 'Sys'},
    //{name: 'act', attr: 'numeric'},
    //{name: 'num', title: 'N', attr: 'numeric'},
    {name: 'encounters', render: bars}
  ]).on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
    .on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); });

  function init() {
    postal.subscribe({channel: 'data', topic: 'changed', callback: dataChanged});
  }

  function dataChanged() {
    bars.max(d3.max(data.tags, d => d.items.length));
    tagsTable.data(data.tags.map(tag => {
      return {
        name: tag.concept.label,
        //category: tag.concept.category,
        //system: tag.concept.system,
        //act:  tag.items.length,
        //num: tag.items.length,
        //num: tag.items.length,
        encounters: tag.items.length,
        tag: tag,
        attr: {}
      }
    }));
    selectionChanged();
  }

  function selectionChanged() {
    let tag, attr = new Map();
    for (tag of selection.tags()) { attr.set(tag.concept.label, 'selected'); }
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
  }

  function updateSelectionList() {
    let tag, list = [];
    for (tag of selection.tags()) {
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

  return {
    init() {
      init();
      return this;
    },

    selection(s) {
      selection = s;
      selection.on('changed.info.tables', selectionChanged);
      return this;
    },

    resize() {
      return this;
    }
  };
}