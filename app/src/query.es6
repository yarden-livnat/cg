/**
 * Created by yarden on 7/13/15.
 */

import * as d3 from 'd3'
import * as data from './services/data'

let dateFormat = d3.time.format('%Y-%m-%d');


function submit() {
  let date = d3.select('#date').property('value');
  let duration = d3.select('#duration').property('value');

  data.fetchAssociations({
    from: dateFormat(d3.time.day.offset(d3.time.week.offset(dateFormat.parse(date), -duration), 1)),
    to: date
  });

}


export function init() {
  d3.select('#submit').on('click', submit);

  // default dates
  d3.select('#date').property('value', '2007-12-14');
  d3.select('#duration').property('value', '1');
}
