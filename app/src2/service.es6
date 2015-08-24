/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import queue from 'queue';

let dateFormat = d3.time.format('%Y-%m-%d');

export let topics = [];
export let pathogens = [];
export let detectors = [];

export function init(cb) {
    queue()
      .defer(d3.json, '/data/kb')
      .defer(d3.json, '/info/pathogens')
      .defer(d3.json, '/info/detectors')
      .await( (err, kb, pathogensList, detectorsList) => {
        if (!err) {
          kb.forEach(d => {
            d.label = d.details == '' ? d.name : d.name+'['+d.details+']';
          });

          topics = kb;
          pathogens = pathogensList;
          detectors = detectorsList;
        }
        cb(err);
      });
}