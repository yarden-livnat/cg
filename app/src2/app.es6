/**
 * Created by yarden on 8/21/15.
 */

import queue from 'queue';
import postal from 'postal';

import * as service from './service';
import * as query from './query';
import * as patients from './patients';
import * as infoTables from './info_tables';

import Map from './map';

let geomap = Map();
let dateFormat = d3.time.format('%Y-%m-%d');

queue()
  .defer(cb => { service.init(cb); })
  .defer(cb => { geomap.init(cb); })
  .awaitAll( err => {
    if (err) error(err);
    else {
      patients.init(service.topics);
      query.init(updateData);
      infoTables.init();
    }
  });


function updateData(err, data) {
  if (err) error(err);
  else {
    // clean up the data
    data.enc.forEach(d  => {
      d.date = d3.time.day.round(dateFormat.parse(d.date));
    });

    patients.set({
      from: data.from,
      to: data.to,
      encounters: data.enc,
      relations: data.associations
    });

    // todo: reapply filters
    postal.publish({channel: 'global', topic: 'render'});
  }
}

function error(err) {
  console.error(err);
}
window.addEventListener('resize', function() {
  console.log('window resize');
});
