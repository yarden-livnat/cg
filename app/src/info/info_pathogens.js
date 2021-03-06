/**
 * Created by yarden on 11/19/15.
 */

import * as d3 from 'd3';
import postal from 'postal';
import Lockr from 'lockr';

import {pathogens_duration} from '../config';
import * as service from '../service';
import chart3 from '../components/chart3'

let dateFormat = d3.timeFormat('%Y-%m-%d');
let dateParse = d3.timeParse('%Y-%m-%d');

// let pathogensTimeFormat = d3.timeFormat.multi([
//   ["%b %d", function(d) { return d.getDate() != 1; }],
//   ["%B", function(d) { return d.getMonth(); }]
// ]);

// function pathogensTimeFormat(date) {
//   if (d3.timeMonth(date) < date)
// }

let pathogens_scale = d3.scaleTime().nice(d3.timeWeek, 1);
pathogens_scale.tickFormat(d3.timeFormat('%b %d'));
pathogens_scale.ticks(d3.timeWeek, 1);

let initialized = false;
let activePathogens = new Map();

let from, to, range, from_week, from_year;

postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});


export function init() {


  let items = d3.select('#pathogens-selection').select('ul').selectAll('li')
    .data(service.pathogens)
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


  let menu = d3.select('#pathogens-selection .items');
  d3.select('#pathogens-selection').select('.anchor').on('click', function() {
    if (menu.classed('visible')) {
      menu.classed('visible', false).style('display', 'none');
    } else {
      menu.classed('visible', true).style('display', 'block');
    }
  });

  menu.on('blur', function() {
    menu.classed('visible', false).style('display', 'none');
  });
}

function dataChanged(params) {
  to = dateParse(params.to); //d3.time.week.ceil(params.to);
  from = d3.timeWeek(d3.timeDay.offset(d3.timeMonth.offset(to, -pathogens_duration), 1));
  range = d3.timeWeek.range(from, to);

  // from_week = d3.time.weekOfYear(from);
  from_week = d3.timeWeek.count(d3.timeYear(from), from);
  from_year = from.getFullYear();

  if (!initialized) {
    initialized = true;
    let list = Lockr.get('pathogens', []);
    d3.select('#pathogens-selection').selectAll('input')
      .property('checked', function(d) { return list.indexOf(d.name) != -1;});

    for (let p of list) {
      selectPathogen(p, true);
    }
  } else {
    for(let name of activePathogens.keys()) {
      updatePathogens(name);
    }
  }
}

function updatePathogens(names) {
  service.fetch('pathogens', [names], from, /*params.*/to)
    .then(function(d) {
      for (let entry of d) {
        let positive = range.map(function (d) { return {x: d, value: 0, items: []}; });
        //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

        for(let item of entry.rows) {
          if (item.positive) {
            item.date = dateParse(item.date);
            let i = d3.timeWeek.count( d3.timeYear(item.date), item.date) + (item.date.getFullYear() - from_year)*52 - from_week;
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
            //interpolate: 'step-after',
            // interpolate: 'cardinal',
            curve: d3.curveMonotoneX,
            values: positive
            //}
            //{
            //  label: 'negative',
            //  color: 'green',
            //  type: 'line',
            //  marker: 'solid',
            //  values: negative
          }];
        activePathogens.get(entry.name).data(series);
      }
    })
    .catch(function(reason) {
      console.error('error: ', reason);
    });
}

function selectPathogen(name, show) {
  if (show) {
    let div = d3.select('#pathogens').append('div')
      .attr('id', 'chart-'+name)
      .classed('pathogen', true);
    let x = d3.scaleTime()
      .nice(d3.timeWeek, 1);
    x.tickFormat(d3.timeFormat('%m %d'));
    x.ticks(d3.timeWeek, 1);
    let c = chart3(div).title(name).xscale(x);

    activePathogens.set(name, c);
    updatePathogens(name);
  }
  else {
    d3.select('#pathogens').select('#chart-'+name).remove();
    activePathogens.delete(name);
  }

  Lockr.set('pathogens',Array.from(activePathogens.keys()));
}