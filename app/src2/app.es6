/**
 * Created by yarden on 8/21/15.
 */

import queue from 'queue';
import postal from 'postal';

import * as service from './service';
import * as query from './query';
import * as patients from './patients';
import * as infoTables from './info_tables';
import * as InfoCharts from './info_charts';
import Detectors from './info_detectors';
import CG from './cg/cg';
import infoSelection from './info_selection';

import Map from './map';

let geomap = Map();
let cg = CG().group(patients.tag_enc_group);
let detectors = Detectors();
let infoChart = InfoCharts().group(patients.tag_enc_group);

let dateFormat = d3.time.format('%Y-%m-%d');

queue()
  .defer(cb => { service.init(cb); })
  .defer(cb => { geomap.init(cb); })
  .awaitAll( err => {
    if (err) error(err);
    else {
      patients.init(service.topics);
      infoTables.init();
      detectors.init(service.detectors.map(patients.addDetector));
      cg(d3.select('#cg-area')).resize(getSize('#cg-area'));
      query.init(updateData);
    }
  });


function updateData(err, data) {
  if (err) error(err);
  else {
    // clean the data
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
    postal.publish({channel: 'global', topic: 'data.changed', data: {from: data.from, to: data.to}});
    postal.publish({channel: 'global', topic: 'render'});
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
  cg.resize(getSize('#cg-area'));
});
