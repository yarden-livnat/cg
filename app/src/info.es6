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

  let summaryChart = chart().el('#summary-chart');
  let selectedChart = chart().el('#selected-chart');

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

    summaryChart.data(binData(data.domain));
  }

  function binData(items) {
    let f = d3.time.day.ceil(data.fromDate),
        t = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(f, t),
        scale = d3.time.scale()
          .domain([f, t])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let bins = range.map(function (day) { return {date: day, value: 0, items: []}; });
    for (let item of items) {
      let i = scale(item.date);
      bins[i].value++;
      bins[i].items.push(item);
    }

    return [{label: 'data', values: bins}];
  }

  function selectionChanged() {
    let from = d3.time.day.ceil(data.fromDate),
        to = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(from, to),
        scale = d3.time.scale()
          .domain([from, to])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let series = [];
    for (let tag of selection.tags()) {
      let bins = range.map(function (day) { return {date: day, value: 0, items: []}; });
      for (let item of tag.items) {
        let i = scale(item.date);
        bins[i].value++;
        bins[i].items.push(item);
      }
      series.push({
        label: tag.concept.label,
        values: bins
      });
    }

    selectedChart.data(series);
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

  api.resize = function() {
    let b = d3.select('#summary-chart').node().getBoundingClientRect();
    let w = parseInt(d3.select('#summary-chart').style('width'));
    let h = parseInt(d3.select('#summary-chart').style('height'));
    summaryChart.resize([w, h]);

    //d3.select('#selected-chart')
    //  .attr('width', w)
    //  .attr('height', size[1]);
    b = d3.select('#selected-chart').node().getBoundingClientRect();
    w = parseInt(d3.select('#selected-chart').style('width'));
    h = parseInt(d3.select('#selected-chart').style('height'));
    selectedChart.resize([w, h]);

    return this;
  };

  return api;
}