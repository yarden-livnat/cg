/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3';
import postal from 'postal';

import * as patients from './patients';
import {fetch} from './service';
import DetectorClass from './components/detector';

export default function() {

  const N_BINS = 20;

  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'render', callback: render});

  let selection;
  let Detector = DetectorClass();
  let detectors = [];
  let detectorsData = [];
  let range = d3.range(0.5, 1, 0.5/N_BINS);
  let current = null;
  let dirty = false;

  function elem(id) {
    return d3.select('#detectors').select('#detector-'+id);
  }

  function init(list) {
    detectors = list;
    detectors.forEach( d => {
      d.probGroup = d.prob.group( p => Math.floor((p-0.5)/0.5 * N_BINS));
      d.similarGroup = d.similar.group( p => Math.floor((p-0.5)/0.5 * N_BINS));
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
    if (current) Detector.select(elem(current.name), false);
    current = current != d ? d : null;
    if (current) Detector.select(elem(current.name), true);
    postal.publish({channel: 'detector', topic: 'changed', data: current && current.prob});
  }

  function update(ext) {
    if (!current) return;
    dirty = true;
    current.prob.filter( p => ext[0] <= p && p <= ext[1]);
    patients.update(current.eid);

    // todo: should this be done in patients.update?
    postal.publish({channel: 'global', topic: 'render'});
  }

  function dataChanged(data) {
    fetch('detectors',detectors.map(d => d.name), data.from, data.to)
      .then( reply => {
        detectorsData = reply;
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
    if (dirty) {
      dirty = false;
      return;
    }
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