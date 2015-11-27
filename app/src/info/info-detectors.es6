/**
 * Created by yarden on 8/18/15.
 */

import d3 from 'd3';
import postal from 'postal';

import * as data from '../data'
import Detector from '../components/detector';

export default function() {

  const N_BINS = 20;

  postal.subscribe({channel: 'data', topic: 'changed', callback: dataChanged});

  let selection;
  let detector = Detector();
  let detectorsData = [];
  let range = d3.range(0.5, 1, 0.5/N_BINS);

  function init() {
    d3.select('#detectors').selectAll('div')
      .data(data.detectors)
      .enter()
        .append('div')
        .attr('id', d => 'detector-'+d.name)
        .attr('class', 'detector')
        .call(detector.build);
  }

  function dataChanged() {
    data.fetch('detectors',data.detectors.map(d => d.name), data.fromDate, data.toDate)
      .then( reply => {
        detectorsData = reply;
        update();
      })
      .catch( e => { console.error('Detectors error:', e); });
  }

  function update() {
    let domain = selection.domainMap;

    let list = [];
    for (let d of detectorsData) {
      let hist = range.map(d => ({x: d, p: 0, s: 0}));

      for(let r of d.rows) {
        if (domain.has(r.id)) {
          if (r.prob > 0.5) {
            hist[Math.min(Math.floor((r.prob - 0.5) / 0.5 * N_BINS), N_BINS - 1)].p++;
          }
          if (r.similar > 0.5) {
            hist[Math.min(Math.floor((r.similar - 0.5) / 0.5 * N_BINS), N_BINS - 1)].s++;
          }
        }
      }
      list.push( {id: d.name, data: hist} );
    }

    console.log('detectors:', list);
    detector(d3.select('#detectors').selectAll('.detector').data(list));
  }

  return {
    init() { init(); },

    selection(s) {
      selection = s;
      selection.on('changed.info.detectors', update);
      return this;
    }
  }
}