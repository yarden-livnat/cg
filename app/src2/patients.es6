/**
 * Created by yarden on 8/21/15.
 */

import crossfilter from 'crossfilter';

let dateFormat = d3.time.format('%Y-%m-%d');

export let fromDate;
export let toDate;
export let datesRange;
export let datesScale;

export let encounters;
export let encountersMap;
export let relations;

export let currentEncounters = new Set();
export let currentTopics = new Set();
export let numActiveEncounters = 0;
export let numActiveRelations = 0;

let encounters_cf = crossfilter();
export let enc_eid = encounters_cf.dimension(d => d.id); enc_eid.name = 'encounters';
export let enc_date = encounters_cf.dimension(d => d.date); enc_date.name = 'encounters';
export let enc_zipcode = encounters_cf.dimension(d => d.zipcode); enc_zipcode.name = 'encounters';
export let enc_tags = encounters_cf.dimension(d => d.id); enc_tags.name = 'encounters';
export let enc_eid_det = encounters_cf.dimension(d => d.id); enc_eid.name = 'encounters'; enc_eid_det.collect = enc_eid_det.group();

let topics = crossfilter();
export let topics_tid = topics.dimension(d => d.id); topics_tid.name = 'topics';
export let topics_cat = topics.dimension(d => d.category); topics_cat.name = 'topics';
export let topics_sys = topics.dimension(d => d.system); topics_sys.name = 'topics';

let relations_cf = crossfilter();
let rel_eid_p = relations_cf.dimension(r => r.enc_id);
let rel_tid_p = relations_cf.dimension(r => r.tag_id);

export let rel_tid_cg = relations_cf.dimension(r => r.tag_id); rel_tid_cg.name = 'relations';
export let tag_enc_group = rel_tid_cg.group().reduce(
  (p,v) => { p.push(v); return p; },
  (p,v) => { p.splice(p.indexOf(v), 1); return p; },
  () => []);

function TagEnc(eid, tid) {
  this.eid = eid;
  this.tid = tid;
}

TagEnc.prototype.valueOf = function() { return this.tid; };

export let rel_tid = relations_cf.dimension(r => { return new TagEnc(r.enc_id, r.tag_id); }); rel_tid.name = 'relations';



function setup(data) {
  fromDate = data.from;
  toDate = data.to;

  let from  = d3.time.day.ceil(dateFormat.parse(fromDate)),
      to    = d3.time.day.offset(d3.time.day.ceil(dateFormat.parse(toDate)), 1);

  datesRange = d3.time.day.range(from, to);
  datesScale = d3.time.scale()
        .domain([from, to])
        .rangeRound([0, datesRange.length]);


  encounters = data.encounters;
  relations = data.relations;

  encountersMap = new Map();
  encounters.forEach( e => {
    e.tags = new Set();
    e.day = datesScale(e.date);
    encountersMap.set(e.id, e)
  });

  relations.forEach(r => encountersMap.get(r.enc_id).tags.add(r.tag_id));
}

export function init(_) {
  topics.add(_);
}

export function set(data) {
  setup(data);

  enc_eid.filterAll();
  enc_date.filterAll();
  enc_zipcode.filterAll();
  enc_tags.filterAll();
  enc_eid_det.filterAll();
  encounters_cf.remove();
  encounters_cf.add(data.encounters);

  rel_eid_p.filterAll();
  rel_tid_p.filterAll();
  rel_tid_cg.filterAll();
  rel_tid.filterAll();
  relations_cf.remove();
  relations_cf.add(data.relations);

  topics_tid.filterAll();
  topics_cat.filterAll();
  topics_sys.filterAll();

  currentEncounters = dimCollect(enc_eid);
  currentTopics = dimCollect(topics_tid);

  numActiveEncounters = currentEncounters.size;
  numActiveRelations = currentTopics.size;

}


/* detectors */

let detectors = new Map();

export function addDetector(d) {
  let cf = crossfilter();
  let detector = {name: d.name, cf: cf, eid: cf.dimension(d => d.id), prob: cf.dimension(d => d.prob), similar: cf.dimension(d => d.similar)};
  detector.eid.cf = cf; detector.eid.name = 'detector';
  detector.prob.cf = cf; detector.prob.name = 'detector';
  detector.similar.cf = cf; detector.similar.name = 'detector';
  detectors.set(detector.name, detector);

  return detector;
}

/* update */

function groupCollect(dim) {
  if (!dim.collect) {
    dim.collect = dim.group();
  }
  return dim.collect.all().reduce((p, v) => v.value ? p.add(v.key) : p, new Set());
}

function dimCollect(dim) {
  let set = new Set();
  for (let item of dim.top(Infinity)) {
    set.add(item.id);
  }
  return set;
}

export function update(dimension) {
  let t = Date.now(); // performance measurement
  let collection;

  /* encounters */
  if (dimension.name === 'encounters') {
    collection = groupCollect(enc_eid);
    rel_eid_p.filter( e => collection.has(e));

    collection = groupCollect(rel_tid_p);
    topics_tid.filter( t => collection.has(t) );

    collection= groupCollect(enc_eid_det);
    detectors.forEach( detector => { detector.eid.filter(e => collection.has(e) )});
  }

  /* topics */
  else if (dimension.name == 'topics') {
    collection = groupCollect(topics_tid);
    rel_tid_p.filter( t => collection.has(t) );

    collection = groupCollect(rel_eid_p);
    enc_eid.filter( e => collection.has(e) );

    collection = groupCollect(enc_eid_det);
    detectors.forEach( detector => { detector.eid.filter(e => collection.has(e) )});
  }

  /* detectors */
  else if (dimension.name == 'detector') {
    collection =  groupCollect(dimension);
     enc_eid_det.filter( e => collection.has(e));

    collection = dimCollect(enc_eid);
    rel_eid_p.filter( e => collection.has(e));

    collection = groupCollect(rel_tid_p);
    topics_tid.filter( t => collection.has(t) );
  }

  /* relations */
  else if (dimension.name == 'relations' ) {
    collection = groupCollect(rel_tid_p);
    topics_tid.filter( t => collection.has(t) );

    collection = groupCollect(rel_eid_p);
    enc_eid.filter( e => collection.has(e) );

    collection = groupCollect(enc_eid_det);
    detectors.forEach( detector => { detector.eid.filter(e => collection.has(e) )});
  }

  currentEncounters = dimCollect(enc_eid);
  currentTopics = dimCollect(topics_tid);

  numActiveEncounters = currentEncounters.size;
  numActiveRelations = currentTopics.size;
  console.log('patient update [',dimension.name,'] in ', Date.now()-t,'  enc:',currentEncounters.size, 'top:', currentTopics.size);
}