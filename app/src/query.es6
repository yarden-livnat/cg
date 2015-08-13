/**
 * Created by yarden on 7/13/15.
 */

import d3 from 'd3'
import Lockr from 'lockr'

import * as data from './data'

let dateFormat = d3.time.format('%Y-%m-%d');


function submit() {
  let date = d3.select('#date').property('value');
  let duration = d3.select('#duration').property('value');

  Lockr.set('query.date', date);
  Lockr.set('query.duration', duration);

  data.fetchAssociations({
    from: dateFormat(d3.time.day.offset(d3.time.week.offset(dateFormat.parse(date), -duration), 1)),
    to: date
  });

}


export function init() {
  d3.select('#submit').on('click', submit);

  // default dates
  let date = Lockr.get('query.date', '2007-12-14');
  let duration = Lockr.get('query.duration', 1);
  let context = Lockr.get('query.context', 4);
  d3.select('#date').property('value', date);
  d3.select('#duration').property('value', duration);
}
