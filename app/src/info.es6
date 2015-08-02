/**
 * Created by yarden on 7/21/15.
 */

import * as d3 from 'd3'
import * as postal from 'postal'

import {pathogens_duration} from './config'
import * as data from './data'
import * as table from './components/table'
import * as chart from './components/chart'

//import * as $ from 'jquery'
//import 'bootstrap-multiselect'

export default function(opt) {
  const MIN_Y = 5;
  const CHART_MAX_WIDTH = 500;

  let dateFormat = d3.time.format('%Y-%m-%d');

  let selection;

  let tagsTable = table().el('#tags-table')
    .columns([{title: 'Tag', name: 'name'}, 'n']);

  let selectedTable = table().el('#selected-table')
    .columns([{title: 'Selected', name: 'name'}, 'n']);

  let categoryTable = table().el('#category-table')
    .columns(['category', 'n']);

  let systemTable = table().el('#system-table')
    .columns(['system', 'n']);

  let summaryChart = chart().el('#summary-chart');
  let selectedChart = chart().el('#selected-chart');

  let charts = new Map([
    ['#summary-chart', summaryChart],
    ['#selected-chart', selectedChart],
  ]);

  let pathogens = new Map();

  function init() {
    postal.subscribe({channel: 'data', topic: 'changed', callback: dataChanged});

    d3.select('#pathogens').on('change', selectPathogen);

    d3.select('#pathogens').selectAll('option')
      .data(data.pathogens)
      .enter()
        .append('option')
          .attr('value', d => d.name)
          .text(d => d.name);

    //$('#pathogens').multiselect();
  }

  function selectPathogen() {
    let id = 'chart-'+this.value;
    if (pathogens.has(this.value)) {
      pathogens.delete(this.value);
      d3.select('#pathogens-area').select('#chart-'+this.value).remove();
    } else {
      let div = d3.select('#pathogens-area').append('div')
        .attr('id', 'chart-'+this.value);
      let c = chart().el(div).title(this.value);
      pathogens.set(this.value, c);
      updatePathogens(this.value);
    }
  }

  function updatePathogens(names) {
    let from = d3.time.day.offset(d3.time.month.offset(data.toDate, -pathogens_duration), 1);
    let to = data.toDate;
    let range = d3.time.day.range(from, to);
    let scale = d3.time.scale()
      .domain([from, to])
      .rangeRound([0, range.length-1]);

    data.fetchPathogens([names], from, data.toDate)
      .then(function(d) {
        for (let entry of d) {
          let positive = range.map(function (d) { return {date: d, value: 0, items: []}; });
          let negative = range.map(function (d) { return {date: d, value: 0, items: []}; });

          for (let item of entry.rows) {
            item.date = dateFormat.parse(item.date);
            let i = scale(item.date);
            let bins = item.positive ? positive : negative;
            bins[i].value++;
            bins[i].items.push(item);
          }

          let series = [
            {
              label: 'positive',
              color: 'red',
              type: 'line',
              marker: 'solid',
              values: positive
            //}
            //{
            //  label: 'negative',
            //  color: 'green',
            //  type: 'line',
            //  marker: 'solid',
            //  values: negative
            }];
          pathogens.get(entry.name).data(series);
        }
      })
      .catch(function(reason) {
        console.error('error: ', reason);
      });
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

    let selectedSeries = [];

    for (let tag of selection.tags()) {
      let bins = histogram(tag.items, range, scale);
      selectedSeries.push({
        label: tag.concept.label,
        color: tag.color,
        type: 'line',
        marker: 'solid',
        values: bins
      });
    }

    for (let tag of selection.excluded()) {
      let bins = histogram(tag.items, range, scale);
      selectedSeries.push({
        label: tag.concept.label,
        color: tag.color,
        type: 'line',
        marker: 'dash',
        values: bins
      });
    }

    //selectedSeries.push({
    //  label: tag.concept.label,
    //  color: tag.color,
    //  type: 'line',
    //  values: histogram(selection.selectedItems(), range)
    //});

    selectedChart.data(selectedSeries);

    let selected  = [];
    let categories = new Map();
    let systems = new Map();
    for (let tag of selection.tags()) {
      selected.push({name:tag.concept.label, n: tag.items.length, tag:tag});

      let entry = categories.get(tag.concept.category);
      if (!entry) {
        entry = {category: tag.concept.category, n: 0};
        categories.set(tag.concept.category, entry);
      }
      entry.n++;

      entry = systems.get(tag.concept.system);
      if (!entry) {
        entry = {system: tag.concept.system, n: 0};
        systems.set(tag.concept.system, entry);
      }
      entry.n++;
    }

    selectedTable.data(selected);
    categoryTable.data(toArray(categories.values()));
    systemTable.data(toArray(systems.values()));
  }

  function toArray(iter) {
    let a = [];
    for (let entry of iter) {
      a.push(entry);
    }
    return a;
  }
  function histogram(items, range, scale) {
    let bins = range.map(function (d) { return {date: d, value: 0, items: []}; });
    for (let item of items) {
      let i = scale(item.date);
      bins[i].value++;
      bins[i].items.push(item);
    }
    return bins;
  }

  let api = {
  };

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
    for (let [name, chart] of charts) {
      let w = parseInt(d3.select(name).style('width'));
      let h = parseInt(d3.select(name).style('height'));
      chart.resize([w, h]);
    }

    for (let [name, chart] of pathogens) {
      let w = parseInt(d3.select(name).style('width'));
      let h = parseInt(d3.select(name).style('height'));
      chart.resize([w, h]);
    }

    return this;
  };

  return api;
}