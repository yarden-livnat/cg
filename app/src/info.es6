/**
 * Created by yarden on 7/21/15.
 */

import * as data from 'services/data'
import * as table from 'components/table'
import * as chart from 'components/chart'
import * as postal from 'postal'

export default function(opt) {
  const MIN_Y = 5;
  const CHART_MAX_WIDTH = 500;

  let selection;

  let tagsTable = table().el(d3.select('#tags-table'))
    .columns([{title: 'Tag', name: 'name'}, 'n']);

  let summary = chart().el('#summary-chart');

  function init() {
    postal.subscribe({channel:'data', topic:'changed', callback: dataChanged});
  }

  function dataChanged() {
    tagsTable.data(data.tags.map(tag => {
      return {
        name: tag.concept.label,
        n: tag.items.length
      }
    }));

    summary.data(binData(data.domain));
  }

  function binData(items) {
    let f = d3.time.day.ceil(data.fromDate),
        t = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(f, t),
        scale = d3.time.scale()
          .domain([f, t])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let bins = range.map(function (day) { return {date: day, value: 0, items: []}; });

    items.forEach(function (item) {
      let i = scale(item.date);
      console.log(item.date+'  scale='+i);
      bins[i].value++;
      bins[i].items.push(item);
    });

    return bins;
  }

  function selectionChanged() {
    //selection.domain
  }


  let api = {};

  api.init = function() {
    init();
    return this;
  };

  api.selection = function(s) {
    selection = s;
    selection.on('changed', selectionChanged);
    return this;
  };

  api.resize = function(size) {
    let w = Math.min(size[0] - parseInt(d3.select('#tags-table').style('width')), CHART_MAX_WIDTH);
    d3.select('#summary-chart')
      .attr('width', w)
      .attr('height', size[1]);
    summary.resize([w, size[1]]);
    return this;
  };

  return api;
}