/**
 * Created by yarden on 7/13/15.
 */
import * as d3 from 'd3'
import * as queue from 'queue'
import * as postal from 'postal'

let dateFormat = d3.time.format('%Y-%m-%d');
let post = postal.channel('data');

let items = new Map();
let kb = new Map();

export let fromDate = Date.now();
export let toDate = Date.now();

export let tags = [];
export let domain = [];
export let population = new Map();
export let pathogens = [];
export let detectors = [];

let ignore_tags = ["conjunctivitis"];
let ignore = [];

function startSpinner() {
  d3.select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'visible');
}

function stopSpinner() {
  d3.select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'none');
}

export function init() {
  queue()
    .defer(d3.json, '/data/kb')
    .defer(d3.csv, '/data/population')
    .defer(d3.json, '/info/pathogens')
    .defer(d3.json, '/info/detectors')
    .await( (err, kbData, popData, pathogensList, detectorsList) => {
      kbData.forEach(d => {
        d.label = d.details == '' ? d.name : d.name+'['+d.details+']';
        kb.set(d.id, d);
        if (ignore_tags.indexOf(d.name) != -1) ignore.push(d.id);
      });

      popData.forEach(function(d) { population.set(d.zipcode, +d.population);});

      pathogens = pathogensList;

      detectors = detectorsList;

      post.publish('ready');
    });
}

export function fetchAssociations(params) {

  let uri = '/query?';
  uri += 'from='+params.from;
  uri += '&to='+params.to;

  startSpinner();
  d3.json(uri, function(err, data) {
    tags = [];
    domain = data.enc;

    if (err) {
      console.error(err);
      stopSpinner();
    } else {
      let map = new Map();

      data.enc.forEach(d  => {
        d.date = dateFormat.parse(d.date);
        items.set(d.id, d);
      });

      data.associations.forEach(d => {
        if (ignore.indexOf(d.tag_id) == -1) {
          let entry = map.get(d.tag_id);
          if (!entry) {
            entry = {id: d.tag_id, concept: kb.get(d.tag_id), items: []};
            map.set(d.tag_id, entry);
            tags.push(entry);
          }
          entry.items.push(items.get(d.enc_id));
        }
      });

      // TODO: handle probabilities

      fromDate = dateFormat.parse(params.from);
      toDate = dateFormat.parse(params.to);

      stopSpinner;
      post.publish('changed');
    }
  });
}

export function fetch(type, names, from, to) {
  if (typeof names == 'string') names = [names];
  if (from instanceof Date) from = dateFormat(from);
  if (to instanceof Date) to = dateFormat(to);

  return new Promise(
    function (resolve, reject) {
      startSpinner();
      d3.json('/'+type)
      .header("Content-Type", "application/json")
      .post(JSON.stringify({ names: names, from: from, to: to }),
        function(error, data) {
          if (error) reject(error);
          else resolve(data);
        })
    });
}
