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

export function init() {
  queue()
    .defer(d3.json, '/data/kb')
    .defer(d3.csv, '/data/population')
    .await( (err, kbData, popData) => {
      kbData.forEach(d => kb.set(d.id, d));
      popData.forEach(function(d) { population.set(d.zipcode, +d.population);});
      post.publish('ready');
    });
}

export function fetchAssociations(params) {

  let uri = '/query?';
  uri += 'from='+params.from;
  uri += '&to='+params.to;

  d3.json(uri, function(err, data) {
    tags = [];
    domain = data.enc;

    let map = new Map();

    data.enc.forEach(d  => items.set(d.id, d));

    data.associations.forEach(d => {
      let entry = map.get(d.tag_id);
      if (!entry) {
        entry = {id: d.tag_id, concept: kb.get(d.tag_id), items: []};
        map.set(d.tag_id, entry);
        tags.push(entry);
      }
      entry.items.push(items.get(d.enc_id));
    });

    // TODO: handle probabilities

    fromDate = params.from;
    toDate = params.to;
    post.publish('changed');
  });
}

