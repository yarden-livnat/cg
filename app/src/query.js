/**
 * Created by yarden on 8/21/15.
 */

import * as d3 from 'd3';
import Lockr from 'lockr';

let dateFormat = d3.timeFormat('%Y-%m-%d');
let dateParse = d3.timeParse('%Y-%m-%d');
let report = () => {} ;

function startSpinner() {
  d3.select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'visible');
}

function stopSpinner() {
  d3.select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'none');
}

function submit() {
  let to = d3.select('#date').property('value');
  let duration = d3.select('#duration').property('value');

  Lockr.set('query.date', to);
  Lockr.set('query.duration', duration);
 
  let from = dateFormat(d3.timeDay.offset(d3.timeWeek.offset(dateParse(to), -duration), 1));

  let url = '/query?from='+from+'&to='+to;

  startSpinner();
  d3.json(url, function(err, data) {
    stopSpinner();
    report( err, data);
  });
}


export function init(cb) {
  report = cb;
  d3.select('#submit').on('click', submit);

  // default dates
  let date = Lockr.get('query.date', '2008-03-30');
  let duration = Lockr.get('query.duration', 1);
  let context = Lockr.get('query.context', 4);

  d3.select('#date').property('value', date);
  d3.select('#duration').property('value', duration);

  submit();
}
