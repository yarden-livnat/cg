/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import queue from 'queue';

let dateFormat = d3.time.format('%Y-%m-%d');

export let topics = [];
export let topicsMap = new Map();
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
            topicsMap.set(d.id, d);
          });

          topics = kb;
          pathogens = pathogensList;
          detectors = detectorsList;
        }
        cb(err);
      });
}

export function fetch(type, names, from, to) {
  if (typeof names == 'string') names = [names];
  if (from instanceof Date) from = dateFormat(from);
  if (to instanceof Date) to = dateFormat(to);

  return new Promise(
    function (resolve, reject) {
      //startSpinner();
      d3.json('/'+type)
        .header("Content-Type", "application/json")
        .post(JSON.stringify({ names: names, from: from, to: to }),
        function(error, data) {
          if (error) reject(error);
          else resolve(data);
        })
    });
}