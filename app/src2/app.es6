/**
 * Created by yarden on 8/21/15.
 */

import queue from 'queue';
import postal from 'postal';

import * as service from './service';
import * as query from './query';
import * as patients from './patients';
import * as infoTables from './info_tables';
import CG from './cg/cg';

import Map from './map';

let geomap = Map();
let cg = CG().dimension(patients.rel_tid);

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
      cg(d3.select('#cg-area')).resize(getSize('#cg-area'));
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
    postal.publish({channel: 'global', topic: 'data.changed'});
  }
}

function error(err) {
  console.error(err);
}

function getSize(el) {
  let d3el = d3.select(el);
  return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
}

window.addEventListener('resize', function() {
  console.log('window resize');
  cg.resize(getSize('#cg'));
});
