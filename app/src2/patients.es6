/**
 * Created by yarden on 8/21/15.
 */

import crossfilter from 'crossfilter';

let encounters = crossfilter();
export let enc_eid = encounters.dimension(d => d.id); enc_eid.name = 'encounters';
export let enc_date = encounters.dimension(d => d.date); enc_date.name = 'encounters';
export let enc_zipcode = encounters.dimension(d => d.zipcode); enc_zipcode.name = 'encounters';

let topics = crossfilter();
export let topics_tid = topics.dimension(d => d.id); topics_tid.name = 'topics';
export let topics_cat = topics.dimension(d => d.category); topics_cat.name = 'topics';
export let topics_sys = topics.dimension(d => d.system); topics_sys.name = 'topics';

let relations = crossfilter();
let rel_eid_p = relations.dimension(r => r.enc_id);
let rel_tid_p = relations.dimension(r => r.tag_id);
export let rel_tid = relations.dimension(r => r.tag_id); rel_tid.name = 'relations';

let detectors = new Map();

function collect(dim, key) {
  let s = new Set();
  for (let g of dim.top(Infinity)) s.add(g[key]);
  return s;
}

export function init(topics_) {
  topics.add(topics_);
}

export function set(data) {
  enc_eid.filterAll();
  enc_date.filterAll();
  enc_zipcode.filterAll();
  encounters.remove();
  encounters.add(data.encounters);

  rel_eid_p.filterAll();
  rel_tid_p.filterAll();
  relations.remove();
  relations.add(data.relations);

  let tid = collect(rel_tid, 'tag_id');
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
  if (dimension.name === 'encounters') {
    let currentEncounters = enc_eid.top(Infinity);

    for (let detector of detectors.values()) detector.eid.filter(currentEncounters);

    rel_eid.filter(currentEncounters);

    let currentTopics = rel_tid.top(Infinity);
    topics_tid.filter(currentTopics);

    updateTags();
  } else if (dimension.name == 'topics') {
    let currentTopics = collect(topics_tid, 'id');
    git
    rel_tid_p.filter( t => currentTopics.has(t) );

    let currentEncounters = collect(rel_eid_p, 'enc_id');
    enc_eid.filter( e => currentEncounters.has(e) );

    detectors.forEach( detector => { detector.eid.filter(e => currentEncounters.has(e) )});

    updateTags();
    //} else if ( /* is a detector */) {
    //
    //} else { /* it's a tags action */
  }
}