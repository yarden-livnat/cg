/**
 * Created by yarden on 8/21/15.
 */

import crossfilter from 'crossfilter';

export let encounters;
export let encountersMap;
export let relations;

let encounters_cf = crossfilter();
export let enc_eid = encounters_cf.dimension(d => d.id); enc_eid.name = 'encounters';
export let enc_date = encounters_cf.dimension(d => d.date); enc_date.name = 'encounters';
export let enc_zipcode = encounters_cf.dimension(d => d.zipcode); enc_zipcode.name = 'encounters';
export let enc_tags = encounters_cf.dimension(d => d.id); enc_tags.name = 'encounters';

let topics = crossfilter();
export let topics_tid = topics.dimension(d => d.id); topics_tid.name = 'topics';
export let topics_cat = topics.dimension(d => d.category); topics_cat.name = 'topics';
export let topics_sys = topics.dimension(d => d.system); topics_sys.name = 'topics';

let relations_cf = crossfilter();
let rel_eid_p = relations_cf.dimension(r => r.enc_id);
let rel_tid_p = relations_cf.dimension(r => r.tag_id);
export let rel_tid = relations_cf.dimension(r => r.tag_id); rel_tid.name = 'relations';

let detectors = new Map();

function collect(dim) {
 return dim.group().top(Infinity).reduce( (p, v) => v.value ? p.add(v.key) : p, new Set() );
}

function setup(data) {
  encounters = data.encounters;
  relations = data.relations;

  encountersMap = new Map();
  encounters.forEach( e => {
    e.tags = new Set();
    encountersMap.set(e.id, e)
  });

  relations.forEach(r => encountersMap.get(r.enc_id).tags.add(r.tag_id));
}

export function init(topics_) {
  topics.add(topics_);
}

export function set(data) {
  setup(data);

  enc_eid.filterAll();
  enc_date.filterAll();
  enc_zipcode.filterAll();
  encounters_cf.remove();
  encounters_cf.add(data.encounters);

  rel_eid_p.filterAll();
  rel_tid_p.filterAll();
  relations_cf.remove();
  relations_cf.add(data.relations);

  let tid = collect(rel_tid);
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
    let currentEncounters = collect(enc_eid);

    rel_eid_p.filter( e => currentEncounters.has(e));

    let currentTopics = collect(rel_tid_p);
    topics_tid.filter( t => currentTopics.has(t) );

    //for (let detector of detectors.values()) detector.eid.filter(currentEncounters);
    updateTags();
  } else if (dimension.name == 'topics') {
    let currentTopics = collect(topics_tid);
    rel_tid_p.filter( t => currentTopics.has(t) );

    let currentEncounters = collect(rel_eid_p);
    enc_eid.filter( e => currentEncounters.has(e) );

    detectors.forEach( detector => { detector.eid.filter(e => currentEncounters.has(e) )});

    updateTags();
    //} else if ( /* is a detector */) {
    //
  } else if (dimension.name == 'relations' ) {
      let currentTopics = collect(rel_tid_p);
      topics_tid.filter( t => currentTopics.has(t) );

      let currentEncounters = collect(rel_eid_p);
      enc_eid.filter( e => currentEncounters.has(e) );
  }
}