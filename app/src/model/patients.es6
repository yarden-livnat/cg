/**
 * Created by yarden on 8/21/15.
 */

import crossfilter from 'crossfilter';

let encounters = crossfilter();
let enc_eid = encounters.dimension(d => d.eid); enc_eid.cf = encounters;
let enc_date = encounters.dimension(d => d.date); enc_date.cf = encounters;
let enc_zipcode = encounters.dimension(d => d.zipcode); enc_zipcode.cf = encounters;

let topics = crossfilter();
let topics_tid = topics.dimension(d => d.id); topics_tid.cf = topics;
let topics_cat = topics.dimension(d => d.category); topics_cat.cf = topics;
let topics_sys = topics.dimension(d => d.system); topics_sys.cf = topics;

let relations = crossfilter();
let rel_eid = relations.domain(r => r.eid); rel_eid.cf = relations;
let rel_tid = relations.domain(r => r.tid); rel_tid.cf = relations;

let detectors = new Map();

export function init(topics_) {
  topics = crossfilter(topics_);
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
  // todo: reapply all filters
  // todo: render all
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