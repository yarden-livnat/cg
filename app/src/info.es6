/**
 * Created by yarden on 7/21/15.
 */

import * as d3 from 'd3'
import * as postal from 'postal'

import {pathogens_duration} from './config'
import * as data from './data'
import * as table from './components/table'
import * as ntable from './components/n-table'
import * as chart from './components/chart'


export default function(opt) {
  const MIN_Y = 5;
  const CHART_MAX_WIDTH = 500;

  let dateFormat = d3.time.format('%Y-%m-%d');

  let selection;

  let tagsTable = ntable('#details-area', 'tags-table').header([
    {name: 'name', title: 'Tag'},
    {name: 'act', attr: 'numeric'},
    {name: 'num', attr: 'numeric'}
  ]);

  let categoryTable = ntable('#details-area', 'category-table').header([
    {name: 'category'},
    {name: 'n'}
  ]);

  let systemTable = ntable('#details-area', 'system-table').header([
    {name: 'system'},
    {name: 'n'}
  ]);


  let summaryChart = chart().el('#summary-chart');
  let selectedChart = chart().el('#selected-chart');

  let charts = new Map([
    ['#summary-chart', summaryChart],
    ['#selected-chart', selectedChart],
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

    for (let d of data.detectors) {
      let c = chart().el('#detector-'+d.name).title(d.name).scale(d3.scale.linear());
      let detector = { name: d.name, chart: c, data:[] };
      detectors.push(detector);
    }
  }

  function dataChanged() {
    tagsTable.data(data.tags.map(tag => {
      return {
        name: tag.concept.label,
        act:  tag.items.length,
        num: tag.items.length
      }
    }));

    summaryChart.data(binData(data.domain));

    for (let name of pathogens.keys()) { updatePathogens(name); }

    data.fetch('detectors', detectors.map(d => d.name), data.fromDate, data.toDate)
      .then( d => {
        for (let entry of d) {
          let detector;
          for (detector of detectors) {
            if (detector.name == entry.name) break;
          }
          detector.data = entry.rows;
          //detector.data.sort( d => d.id );
        }
        updateDetectors();
      })
      .catch( e => { console.error('Detectors error:', e); });
  }

  function binData(items) {
    let f = d3.time.day.ceil(data.fromDate),
      t = d3.time.day.offset(d3.time.day.ceil(data.toDate), 1),
      range = d3.time.day.range(f, t),
      scale = d3.time.scale()
        .domain([f, t])
        .rangeRound([0, Math.max(range.length, MIN_Y)]);  // hack: rangeRound still give fraction if range is 0-1

    let bins = range.map(function (day) { return {x: day, value: 0, items: []}; });
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

    let categories = new Map();
    let systems = new Map();
    for (let tag of selection.tags()) {
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

    tagsTable.data(data.tags.map(tag => {
      return {
        name: tag.concept.label,
        act:  selection.countActive(tag.items),
        num: tag.items.length
      }
    }));

    mark(selection.tags(), 'selected');
    mark(selection.excluded(), 'excluded');

    categoryTable.data(toArray(categories.values()));
    systemTable.data(toArray(systems.values()));
  }

  function mark(list, marker) {
    let s = new Set();
    for (let tag of list) { s.add(tag.concept.label); }
    let rows = tagsTable.row(
        d => s.has(d.name)
    );
    rows.classed(marker, true);
  }

  function selectPathogen(name, show) {
    if (show) {
      let div = d3.select('#pathogens-charts').append('div')
        .attr('id', 'chart-'+name);
      let c = chart().el(div).title(name);
      pathogens.set(name, c);
      updatePathogens(name);
    }
    else {
      d3.select('#pathogens-charts').select('#chart-'+name).remove();
      pathogens.delete(name);
    }
  }

  function updatePathogens(names) {
    let from = d3.time.day.offset(d3.time.month.offset(data.toDate, -pathogens_duration), 1);
    let to = data.toDate;
    let range = d3.time.day.range(from, to);
    let scale = d3.time.scale()
      .domain([from, to])
      .rangeRound([0, range.length-1]);

    data.fetch('pathogens', [names], from, data.toDate)
      .then(function(d) {
        for (let entry of d) {
          let positive = range.map(function (d) { return {x: d, value: 0, items: []}; });
          let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

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



  function updateDetectors() {
    let domain = selection.domain; // check that it is sorted by id
    let n = domain.length;

    for (let detector of detectors) {
      let prob = [], similar = [];
      let i = 0;
      for (let j=0; j<100; j++) {
        prob.push({x: j/100, value: 0, items:[]});
        similar.push({x: j/100, value: 0, items: []});
      }

      let found = 0;
      for (let entry of detector.data) {
        while (i < n && domain[i].id < entry.id) i++;
        if (i == n) break;
        if (domain[i].id == entry.id) {
          found++;
          let p = prob[Math.min(Math.floor(entry.prob*100), 99)];
          p.value++;
          p.items.push(entry);

          let s = similar[Math.min(Math.floor(entry.similar*100), 99)];
          s.value ++;
          s.items.push(entry);

          i++;
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
    let name, c;
    for ([name, c] of charts) {
      let w = parseInt(d3.select(name).style('width'));
      let h = parseInt(d3.select(name).style('height'));
      c.resize([w, h]);
    }

    for ([name, c] of pathogens) {
      let w = parseInt(d3.select('#chart-'+name).style('width'));
      let h = parseInt(d3.select('#chart-'+name).style('height'));
      c.resize([w, h]);
    }

    let h = parseInt(d3.select('#info-area').style('height')) - parseInt(d3.select('#pathogens').style('height'));
    console.log('h = ',h);
    console.log('max = ', d3.select('#pathogens-charts').style('max-height'));
    d3.select('#pathogens-charts').style('max-height', h+'px');
    return this;
  };

  return api;
}