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
  let currentChart = chart().el('#current-chart');

  let charts = new Map([
    ['#summary-chart', summaryChart],
    ['#selected-chart', selectedChart],
    ['#current-chart', currentChart]
  ]);

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

    return [{label: 'data', color: 'black', values: bins}];
  }

  function selectionChanged() {
    let from = d3.time.day.ceil(data.fromDate),
        to = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(from, to),
        scale = d3.time.scale()
          .domain([from, to])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let domain = new Set(selection.domain);
    let selectedSeries = [];
    let currentSeries = [];

    for (let tag of selection.tags()) {
      let selectedBins = range.map(function (day) { return {date: day, value: 0, items: []}; });
      let currentBins = range.map(function (day) { return {date: day, value: 0, items: []}; });

      for (let item of tag.items) {
        let i = scale(item.date);
        selectedBins[i].value++;
        selectedBins[i].items.push(item);

        if (domain.has(item)) {
          currentBins[i].value++;
          currentBins[i].items.push(item);
        }
      }

      selectedSeries.push({
        label: tag.concept.label,
        color: tag.color,
        values: selectedBins
      });

      currentSeries.push({
        label: tag.concept.label,
        color: tag.color,
        values: currentBins
      });
    }

    selectedChart.data(selectedSeries);
    currentChart.data(currentSeries);
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
    for (var [name, chart] of charts) {
      let w = parseInt(d3.select(name).style('width'));
      let h = parseInt(d3.select(name).style('height'));
      chart.resize([w, h]);
    }

    return this;
  };

  return api;
}