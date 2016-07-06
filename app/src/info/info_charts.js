/**
 * Created by yarden on 8/6/15.
 */

import * as d3 from 'd3';
import postal from 'postal';

import chart3 from '../components/chart3'
import patients from '../model/patients';
import * as tagSelection from '../model/tag_selection';
import {topicsMap} from '../service';

const MIN_Y = 5;
const CHART_MAX_WIDTH = 500;

export default function() {
  let dateFormat = d3.timeFormat('%Y-%m-%d');
  let dateParse = d3.timeParse('%Y-%m-%d');

  let fromDate, toDate;

  let summaryData = [];
  let summaryChart = chart3('#summary-chart', true).title('summary');

  let group;
  let selected = new Map();
  let highlighted;

  let charts = new Map([
    ['#summary-chart', summaryChart]
    //['#selected-chart', selectedChart],
  ]);

  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'render', callback: render});
  postal.subscribe({channel: 'global', topic: 'highlight.topic', callback: highlight});

  function dataChanged(data) {
    fromDate = dateParse(data.from);
    toDate = dateParse(data.to);
  }

  function render() {
    let from  = d3.timeDay.ceil(fromDate),
        to    = d3.timeDay.offset(d3.timeDay.ceil(toDate), 1),
        range = d3.timeDay.range(from, to),
        scale = d3.scaleTime()
          .domain([from, to])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    if (selected.size > 0) {
      for(let entry of selected.entries()) {
        if (!tagSelection.isSelected(entry[0])) {
          selected.delete(entry[0]);
        }
      }
    }
    if (tagSelection.selected.size > 0) {
      for(let tid of tagSelection.selected) {
        if (!selected.has(tid)) {
          let topic = topicsMap.get(tid);
          selected.set(tid, topic);
        }
      }
    }

    let selectedSeries = [];

    if (highlighted) {
      /* test */
      let enc = patients.tag_enc_group.all().filter(function (d) { return d.key == highlighted.id;});
      //let records = enc[0].value.map(v => patients.encountersMap.get(v.enc_id));
      let records = [];
      for (let v of enc[0].value) {
        records.push(patients.encountersMap.get(v.enc_id));
      }
      selectedSeries.push({
        label:  highlighted.name,
        color:  highlighted.color,
        type:   'line',
        marker: 'solid',
        values: histogram(records, range, scale)
      });
    }

    //let map = new Map();
    //
    //for (let r of patients.rel_tid.)) {
    //  let entry = map.get(r.tag_id);
    //  if (!entry) map.set(r.tag_id, entry = []);
    //  entry.push(patients.encountersMap.get(r.enc_id));
    //}
    //
    //for (let entry of map) {
    //  let topic = topicsMap.get(entry[0]);
    //  console.log('info: topic ',topic.name );
    //  selectedSeries.push({
    //    label:  topic.name,
    //    color:  topic.color,
    //    type:   'line',
    //    marker: 'solid',
    //    values: histogram(entry[1], range, scale)
    //  });
    //}

    var current = [];
    for (let eid of patients.currentEncounters.values()) {
      current.push(patients.encountersMap.get(eid));
    }

    selectedSeries.push({
      label:  "focus",
      color:  '#EFEDED',
      type:   'area',
      //right: true,
      marker: 'solid',
      values: histogram(current, range, scale)
    });

    //for(let item of group.all()) {
    //  if (tagSelection.isSelected(item.key)) {
    //    let topic = topicsMap.get(item.key);
    //    let records = item.value.map( v => patients.encountersMap.get(v.enc_id));
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

  function highlight(node) {
    if (node.show)  highlighted = node.topic;
    else highlighted = null;
    render();
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