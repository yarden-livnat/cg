/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3';
import postal from 'postal';
import {DETECTOR_OPT} from './config';
import * as patients from './patients';
import {fetch} from './service';
import DetectorClass from './components/detector';

export default function() {

  const N_BINS = 20;
  const MIN_PROB = DETECTOR_OPT.MIN_PROB;
  const PROB_RANGE = 1-MIN_PROB;

  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'render', callback: render});

  let selection;
  let Detector = DetectorClass().minX(MIN_PROB);
  let detectors = [];
  let range = d3.range(MIN_PROB, 1, (1-MIN_PROB)/N_BINS);
  let current = null;

  function elem(id) {
    return d3.select('#detectors').select('#detector-'+id);
  }

  function init(list) {
    detectors = list;
    detectors.forEach( d => {
      d.probGroup = d.prob.group( p => Math.floor((p-MIN_PROB)/PROB_RANGE * N_BINS));
      d.similarGroup = d.similar.group( p => Math.floor((p-MIN_PROB)/PROB_RANGE * N_BINS));
    });

    d3.select('#detectors').selectAll('div')
      .data(list)
      .enter()
        .append('div')
        .attr('id', d => 'detector-'+d.name)
        .attr('class', 'detector')
        .call(Detector.build);
    Detector.on('select', select);
    Detector.on('range', update);
  }

  function select(d){
    if (current) {
      Detector.select(elem(current.name), false);
      current.prob.filterAll();
      patients.update(current.eid);
    }
    current = current != d ? d : null;
    if (current) {
      Detector.select(elem(current.name), true);
      update(current.prob.ext);
    }

    postal.publish({channel: 'detector', topic: 'changed', data: current && current.prob});
  }

  function update(ext) {
    if (!current || !ext) return;
    current.ext = ext;
    current.prob.filter( p => ext[0] <= p && p <= ext[1]);

    patients.update(current.eid);
    postal.publish({channel: 'global', topic: 'render'});
  }

  function dataChanged(data) {
    fetch('detectors',detectors.map(d => d.name), data.from, data.to)
      .then( reply => {
        for (let i=0; i<reply.length; i++) {
          let detector = detectors[i];
          let data = reply[i];
          detector.eid.filterAll();
          detector.prob.filterAll();
          detector.similar.filterAll();
          detector.cf.remove();
          detector.cf.add(data.rows);
        }
        render();
      })
      .catch( e => { console.error('Detectors error:', e); });
  }

  function render() {
    for (let detector of detectors) {
      let hist = range.map(d => ({x: d, p: 0, s: 0}));

      detector.probGroup.all().forEach( d => { if (d.key >= 0) hist[d.key].p = d.value; });
      //detector.similarGroup.all().forEach( d => { if (d.key >= 0) hist[d.key].s = d.value; });
      detector.data = hist;
    }

    Detector(d3.select('#detectors').selectAll('.detector'));
  }

  return {
    init : init
  }
}