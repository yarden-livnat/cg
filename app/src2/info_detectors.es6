/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3';
import postal from 'postal';

//import * as data from '../data'
import {fetch} from './service';
import Detector from './components/detector';

export default function() {

  const N_BINS = 20;

  postal.subscribe({channel: 'global', topic: 'data.changed', callback: dataChanged});
  postal.subscribe({channel: 'global', topic: 'render', callback: render});

  let selection;
  let detectorClass = Detector();
  let detectors = [];
  let detectorsData = [];
  let range = d3.range(0.5, 1, 0.5/N_BINS);

  function init(list) {
    detectors = list;
    d3.select('#detectors').selectAll('div')
      .data(list)
      .enter()
        .append('div')
        .attr('id', d => 'detector-'+d.name)
        .attr('class', 'detector')
        .call(detectorClass.build);
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
          detector.cf.remove();
          detector.cf.add(data.rows);
        }
        render();
      })
      .catch( e => { console.error('Detectors error:', e); });
  }

  function render() {
    let list = [];
    for (let detector of detectors) {
      let hist = range.map(d => ({x: d, p: 0, s: 0}));

      detector.prob.group( p => Math.floor((p-0.5)/0.5 * N_BINS)).top(Infinity)
        .forEach( d => { if (d.key >= 0) hist[d.key].p = d.value; });

      detector.similar.group( p => Math.floor((p-0.5)/0.5 * N_BINS)).top(Infinity)
        .forEach( d => { if (d.key >= 0) hist[d.key].s = d.value; });

      list.push( {id: detector.name, data: hist} );
    }

    detectorClass(d3.select('#detectors').selectAll('.detector').data(list));
  }

  return {
    init : init
  }
}