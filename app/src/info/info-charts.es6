/**
 * Created by yarden on 8/6/15.
 */

import d3 from 'd3'
import postal from 'postal'

import {pathogens_duration} from '../config'
import * as data from '../data'
import chart from '../components/chart'
import chart2 from '../components/chart2'


export default function(opt) {
  const MIN_Y = 5;
  const CHART_MAX_WIDTH = 500;

  let dateFormat = d3.time.format('%Y-%m-%d');

  let selection;
  let summaryData = [];
  let summaryChart = chart2('#summary-chart');
  //let selectedChart = chart().el('#selected-chart');

  let pathogensTimeFormat = d3.time.format.multi([
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth(); }],
  ]);

  let pathogens_scale = d3.time.scale()
    .nice(d3.time.week, 1);
  pathogens_scale.tickFormat(d3.format('%b %d'));
  pathogens_scale.ticks(d3.time.week, 1);

  let charts = new Map([
    ['#summary-chart', summaryChart],
    //['#selected-chart', selectedChart],
  ]);

  let pathogens = new Map();

  let detectors = [];

  function init() {
    postal.subscribe({channel: 'data', topic: 'changed', callback: dataChanged});

    /* pathogens */
    let items = d3.select('#pathogens').select("ul").selectAll('li')
      .data(data.pathogens)
      .enter()
      .append('li');

    items.append('input')
      .attr('type', 'checkbox')
      .attr('value', d => d.name)
      .on("change", function() {
        selectPathogen(this.value, this.checked);
      });

    items.append('span')
      .text(d => d.name);


    let menu = d3.select('#pathogens .items');
    d3.select('#pathogens').select('.anchor').on('click', function() {
      if (menu.classed('visible')) {
        menu.classed('visible', false).style('display', 'none');
      } else {
        menu.classed('visible', true).style('display', 'block');
      }
    });

    menu.on('blur', function() {
      menu.classed('visible', false).style('display', 'none');
    });

    /* detectors */
    d3.select('#detectors-charts').selectAll('div')
      .data(data.detectors)
      .enter()
      .append('div')
      .attr('id', d => 'detector-'+d.name);

    detectors = new Map();
    for (let d of data.detectors) {
      detectors.set(d.name, {
        name:  d.name,
        chart: chart2('#detector-' + d.name).title(d.name).xscale(d3.scale.linear()),
        data:  []
      });
    }
  }

  function dataChanged() {
    let f = d3.time.day.ceil(data.fromDate),
        t = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(f, t),
        scale = d3.time.scale()
          .domain([f, t])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let bins = range.map(function (day) { return {x: day, value: 0, items: []}; });
    for (let item of data.domain) {
      let i = scale(item.date);
      bins[i].value++;
      bins[i].items.push(item);
    }

    summaryData = [{label: 'data', color: 'black', values: bins, right: true}];
    summaryChart.data(summaryData);

    for (let name of pathogens.keys()) { updatePathogens(name); }

    let names = [];
    for (let d of detectors.values()) names.push(d.name);
    data.fetch('detectors',names, data.fromDate, data.toDate)
      .then( list => {
        for (let d of list) {
          let detector = detectors.get(d.name);
          detector.data = new Map();
          for (let r of d.rows) {
            detector.data.set(r.id, r);
          }
        }
        updateDetectors();
      })
      .catch( e => { console.error('Detectors error:', e); });
  }

  function selectionChanged() {
    let from  = d3.time.day.ceil(data.fromDate),
        to    = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
        range = d3.time.day.range(from, to),
        scale = d3.time.scale()
          .domain([from, to])
          .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let selectedSeries = [];

    for(let tag of selection.selected()) {
      selectedSeries.push({
          label:  tag.concept.label,
          color:  tag.color,
          type:   'line',
          marker: 'solid',
          values: histogram(tag.items, range, scale)
        }
      );
    }

    for(let tag of selection.excluded()) {
      selectedSeries.push({
          label:  tag.concept.label,
          color:  tag.color,
          type:   'line',
          marker: 'dash',
          values:  histogram(tag.items, range, scale)
        }
      );
    }

    //selectedSeries.push({
    //  label: tag.concept.label,
    //  color: tag.color,
    //  type: 'line',
    //  values: histogram(selection.selectedItems(), range)
    //});

    //selectedChart.data(selectedSeries);

    selectedSeries.push(summaryData[0]);
    summaryChart.data(selectedSeries);

    updateDetectors();
  }

  function selectPathogen(name, show) {
    if (show) {
      let div = d3.select('#pathogens-charts').append('div')
        .attr('id', 'chart-'+name);
      let x = d3.time.scale()
        .nice(d3.time.week, 1);
      x.tickFormat(d3.time.format('%m %d'));
      x.ticks(d3.time.week, 1);
      let c = chart2(div).title(name).xscale(x);

      pathogens.set(name, c);
      updatePathogens(name);
    }
    else {
      d3.select('#pathogens-charts').select('#chart-'+name).remove();
      pathogens.delete(name);
    }
  }

  function updatePathogens(names) {
    let from = d3.time.week(d3.time.day.offset(d3.time.month.offset(data.toDate, -pathogens_duration), 1));
    let to = d3.time.week.ceil(data.toDate);
    let range = d3.time.week.range(from, to);

    let start = d3.time.weekOfYear(from);

    data.fetch('pathogens', [names], from, data.toDate)
      .then(function(d) {
        for (let entry of d) {
          let positive = range.map(function (d) { return {x: d, value: 0, items: []}; });
          //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

          for(let item of entry.rows) {
            if (item.positive) {
              item.date = dateFormat.parse(item.date);
              let i = d3.time.weekOfYear(item.date) - start;
              //let bins = item.positive ? positive : negative;
              positive[i].value++;
              positive[i].items.push(item);
            }
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

  function updateDetectors() {

    for (let detector of detectors.values()) {
      let prob = [], similar = [];

      for (let j=0; j<100; j++) {
        prob.push({x: j/100, value: 0, items:[]});
        similar.push({x: j/100, value: 0, items: []});
      }

      if (detector.data.size > 0) {
        for(let e of selection.domain) {
          let entry = detector.data.get(e.id);
          if (entry == undefined || entry == null) {
            console.log('[Detector] missing prob', e.id);
          } else {
            let p = prob[Math.min(Math.floor(entry.prob * 100), 99)];
            p.value++;
            p.items.push(entry);

            let s = similar[Math.min(Math.floor(entry.similar * 100), 99)];
            s.value++;
            s.items.push(entry);
          }

        }
      }

      prob[0].value = 0;
      similar[0].value = 0;
      let series = [{
        label: 'prob',
        color: 'black',
        type: 'line',
        marker: 'solid',
        values: prob
      },
        {
          label: 'similar',
          color: 'gray',
          type: 'line',
          marker: 'dash',
          values: similar
        }];
      detector.chart.data(series);
    }
  }

  function toArray(iter) {
    let a = [];
    for (let entry of iter) {
      a.push(entry);
    }
    return a;
  }
  function histogram(items, range, scale) {
    let bins = range.map(function (d) { return {x: d, value: 0, items: []}; });
    for (let item of items) {
      let i = scale(item.date);
      bins[i].value++;
      bins[i].items.push(item);
    }
    return bins;
  }

  return {
    init() {
      init();
      return this;
    },

    selection(s) {
      selection = s;
      selection.on('changed.info.charts', selectionChanged);
      return this;
    },

    resize() {
      let name, c;
      for([name, c] of charts) {
        let w = parseInt(d3.select(name).style('width'));
        let h = parseInt(d3.select(name).style('height'));
        c.resize([w, h]);
      }

      for([name, c] of pathogens) {
        let w = parseInt(d3.select('#chart-' + name).style('width'));
        let h = parseInt(d3.select('#chart-' + name).style('height'));
        c.resize([w, h]);
      }

      let h = parseInt(d3.select('#info-area').style('height')) - parseInt(d3.select('#pathogens').style('height'));
      d3.select('#pathogens-charts').style('max-height', h + 'px');
      return this;
    }
  }
}