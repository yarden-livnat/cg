/**
 * Created by yarden on 8/6/15.
 */

import d3 from 'd3';
import postal from 'postal';

import * as utils from './utils';
import chart3 from './components/chart3'
import * as patients from './patients';
import * as tagSelection from './tag_selection';
import {topicsMap} from './service';

const MIN_Y = 5;
const CHART_MAX_WIDTH = 500;

export default function() {
  let dateFormat = d3.time.format('%Y-%m-%d');
  let fromDate, toDate;

  let summaryData = [];
  let summaryChart = chart3('#summary-chart', true);

  let group;
  let selected = new Map();

  let charts = new Map([
    ['#summary-chart', summaryChart]
    //['#selected-chart', selectedChart],
  ]);

  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'render', callback: render});


  function dataChanged(data) {
    fromDate = dateFormat.parse(data.from);
    toDate = dateFormat.parse(data.to);
    //let f = d3.time.day.ceil(from),
    //    t = d3.time.day.offset(d3.time.day.ceil(to), 1),
    //    range = d3.time.day.range(f, t),
    //    scale = d3.time.scale()
    //      .domain([f, t])
    //      .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1
    //
    //let bins = range.map(function (day) { return {x: day, value: 0, items: []}; });
    //for (let item of data.domain) {
    //  let i = scale(item.date);
    //  bins[i].value++;
    //  bins[i].items.push(item);
    //}

    //summaryData = [{label: 'data', color: 'black', values: bins, right: true}];
    //summaryChart.data(summaryData);
  }

  function render() {
    let from  = d3.time.day.ceil(fromDate),
        to    = d3.time.day.offset(d3.time.day.ceil(toDate), 1),
        range = d3.time.day.range(from, to),
        scale = d3.time.scale()
          .domain([from, to])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1


    if (selected.size > 0) {
      for(let entry of selected.entries()) {
        if (!tagSelection.isSelected(entry[0])) {
          utils.release_color(entry[1]);
          selected.delete(entry[0]);
        }
      }
    }
    if (tagSelection.selected.size > 0) {
      for(let tid of tagSelection.selected) {
        if (!selected.has(tid)) {
          let topic = topicsMap.get(tid);
          utils.assign_color(topic);
          selected.set(tid, topic);
        }
      }
    }

    let selectedSeries = [];

    let map = new Map();
    for (let r of patients.relations) {
      if (tagSelection.isSelected(r.tag_id)) {
        let entry = map.get(r.tag_id);
        if (!entry) map.set(r.tag_id, entry = []);
        entry.push(patients.encountersMap.get(r.enc_id));
      }
    }

    for (let entry of map) {
      let topic = topicsMap.get(entry[0]);
      selectedSeries.push({
        label:  topic.name,
        color:  topic.color,
        type:   'line',
        marker: 'solid',
        values: histogram(entry[1], range, scale)
      });
    }
    //for(let item of group.all()) {
    //  if (tagSelection.isSelected(item.key)) {
    //    let topic = topicsMap.get(item.key);
    //    let records = item.value.map( v => patients.encountersMap.get(v.enc_id));
    //    utils.assign_color(topic);
    //    selectedSeries.push({
    //      label:  topic.name,
    //      color:  topic.color,
    //      type:   'line',
    //      marker: 'solid',
    //      values: histogram(records, range, scale)
    //    });
    //  }
    //}

    //for(let tag of tagSelection.excluded()) {
    //  selectedSeries.push({
    //      label:  tag.concept.label,
    //      color:  tag.color,
    //      type:   'line',
    //      marker: 'dash',
    //      values:  histogram(tag.items, range, scale)
    //    }
    //  );
    //}

    //selectedSeries.push({
    //  label: tag.concept.label,
    //  color: tag.color,
    //  type: 'line',
    //  values: histogram(selection.selectedItems(), range)
    //});

    //selectedChart.data(selectedSeries);

    //selectedSeries.push(summaryData[0]);
    summaryChart.data(selectedSeries);
  }

  function toArray(iter) {
    let a = [];
    for(let entry of iter) {
      a.push(entry);
    }
    return a;
  }


  function histogram(items, range, scale) {
    let bins = range.map(function (d) { return {x: d, value: 0, items: []}; });
    for(let item of items) {
      let i = scale(item.date);
      bins[i].value++;
      bins[i].items.push(item);
    }
    return bins;
  }

  let info = function() {};

  info.group = function(_) {
    group = _;
    return this;
  };

  info.resize = function() {
    let name, c;
    for([name, c] of charts) {
      let w = parseInt(d3.select(name).style('width'));
      let h = parseInt(d3.select(name).style('height'));
      c.resize([w, h]);
    }
    return this;
  };

  return info;
  //{
  //
  //  group(_) {
  //    group = _;
  //    return this;
  //  },
  //
  //  resize() {
  //    let name, c;
  //    for([name, c] of charts) {
  //      let w = parseInt(d3.select(name).style('width'));
  //      let h = parseInt(d3.select(name).style('height'));
  //      c.resize([w, h]);
  //    }
  //    return this;
  //  }
  //}
}