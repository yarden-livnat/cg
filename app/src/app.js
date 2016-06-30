/**
 * Created by yarden on 8/21/15.
 */

import * as d3 from 'd3';
import {queue} from 'd3-queue';
import postal from 'postal';

// import {foo, bar, x} from './test';

import * as patients from './patients';
import * as service from './service';
import * as query from './query';

import * as infoTables from './info/info_tables';
import InfoCharts from './info/info_charts';
import Detectors from './info/info_detectors';
import infoSelection from './info/info_selection';
import * as InfoPathogens from './info/info_pathogens';
// import CG from './cg/cg';
import * as explore from './explore';

import Map from './map';

let geomap = Map();
// let cg = CG().group(patients.tag_enc_group);
let detectors = Detectors();
let infoChart = InfoCharts().group(patients.tag_enc_group);

let dateFormat = d3.timeFormat('%Y-%m-%d');
let dateParse = d3.timeParse('%Y-%m-%d');

explore.init(patients.tag_enc_group);

queue()
  .defer(cb => { service.init(cb); })
  .defer(cb => { geomap.init(cb); })
  .awaitAll( err => {
    if (err) error(err);
    else {
      patients.init(service.topics);
      infoTables.init();
      InfoPathogens.init();
      detectors.init(service.detectors.map(patients.addDetector));
      // cg(d3.select('#cg-area')).resize(getSize('#cg-area'));
      query.init(updateData);
      window.dispatchEvent(new Event('resize'));
    }
  });


function updateData(err, data) {
  if (err) error(err);
  else {
    // clean the data
    data.enc.forEach(d  => {
      d.date = d3.timeDay.round(dateParse(d.date));
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
  // cg.resize(getSize('#cg-area'));
  d3.select('#pathogens').style('max-height', getSize('#pathogens-area')[1]-20+'px');
});
