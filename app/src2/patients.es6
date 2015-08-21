/**
 * Created by yarden on 8/21/15.
 */

import crossfilter from 'crossfilter';

let encounters = crossfilter();
export let enc_eid = encounters.dimension(d => d.id); enc_eid.cf = encounters;
export let enc_date = encounters.dimension(d => d.date); enc_date.cf = encounters;
export let enc_zipcode = encounters.dimension(d => d.zipcode); enc_zipcode.cf = encounters;

let topics = crossfilter();
export let topics_tid = topics.dimension(d => d.id); topics_tid.cf = topics;
export let topics_cat = topics.dimension(d => d.category); topics_cat.cf = topics;
export let topics_sys = topics.dimension(d => d.system); topics_sys.cf = topics;

let relations = crossfilter();
let rel_eid = relations.dimension(r => r.enc_id);
let rel_tid = relations.dimension(r => r.tag_id);
let rel_eid_g = rel_eid.group();
let rel_tid_g = rel_tid.group();

let detectors = new Map();

export function init(topics_) {
  topics.add(topics_);
}

export function set(data) {
  enc_eid.filterAll();
  enc_date.filterAll();
  enc_zipcode.filterAll();
  encounters.remove();
  encounters.add(data.encounters);

  rel_eid.filterAll();
  rel_tid.filterAll();
  relations.remove();
  relations.add(data.relations);

  //enc_date.filter( d => d.date >= data.fromDate && d.date <= data.toDate);
  let tid = new Set();
  for (let g of rel_tid_g.top(Infinity)) {
    tid.add(g.key);
  }
  topics_tid.filter(t => tid.has(t));
}

function updateTags() {
  console.log('update tags');
}

export function addDetector(name) {
  let cf = crossfilter();
  let detector = {name: name, cf: cf, eid: cf.dimension(d => d.eid), prob: cf.dimension(d => d.prob)};
  detector.eid.cf = cf;
  detector.prob.cf = cf;
  detectors.set(name, detector);

  // todo: what to return?
}

export function update(dimension) {
  if (dimension.cf === encounters) {
    let currentEncounters = enc_eid.top(Infinity);

    for (let detector of detectors.values()) detector.eid.filter(currentEncounters);

    rel_eid.filter(currentEncounters);

    let currentTopics = rel_tid.top(Infinity);
    topics_tid.filter(currentTopics);

    updateTags();
  } else if (dimension.cf == topics) {
    rel_tid.filter(dimension.top(Infinity));
    enc_eid.filter(rel_eid.top(Infinity));
    let activeEncounters = enc_eid.top(Infinity);
    detectors.forEach( detector => { detector.eid.filter(activeEncounters)});

    updateTags();
    //} else if ( /* is a detector */) {
    //
    //} else { /* it's a tags action */
  }
}