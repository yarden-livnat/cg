/**
 * Created by yarden on 8/21/15.
 */

import * as d3 from 'd3';
import crossfilter from 'crossfilter';

let dateParse = d3.timeParse('%Y-%m-%d');

let detectors = new Map();

let encounters_cf = crossfilter();
let topics = crossfilter();
let relations_cf = crossfilter();

let rel_eid_p = dimension(relations_cf, r => r.enc_id, 'relations');
let rel_tid_p =  dimension(relations_cf, r => r.tag_id, 'relations');

function dimension (cf, f, name) {
  let d = cf.dimension(f);
  d.name = name;
  return d;
}

function TagEnc(eid, tid) {
  this.eid = eid;
  this.tid = tid;
}

TagEnc.prototype.valueOf = function () {
  return this.tid;
};

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


let patients = {
  fromDate: null,
  toDate: null,
  datesRange: null,
  datesScale: d3.scaleTime(),
  encounters: 0,
  encountersMap: new Map(),
  relations: 0,
  currentEncounters: new Set(),
  currentTopics: new Set(),
  numActiveEncounters: 0,
  numActiveRelations: 0,

  enc_eid: dimension(encounters_cf, d => d.id, 'encounters'),
  enc_date: dimension(encounters_cf, d => d.date, 'encounters'),
  enc_zipcode: dimension(encounters_cf, d => d.zipcode, 'encounters'),
  enc_tags: dimension(encounters_cf, d => d.id, 'encounters'),
  enc_eid_det: dimension(encounters_cf, d => d.id, 'encounters'),


  topics_tid: dimension(topics, d => d.id, 'topics'),
  topics_cat: dimension(topics, d => d.category, 'topics'),
  topics_sys: dimension(topics, d => d.system, 'topics'),


  rel_tid_cg: dimension(relations_cf, r => r.tag_id, 'relations'),

  tag_enc_group: null,

  rel_tid: dimension(relations_cf, r => { return new TagEnc(r.enc_id, r.tag_id);}, 'relations'),

  init(_) {
    topics.add(_);
  },

  set(data) {
    setup(data);

    this.enc_eid.filterAll();
    this.enc_date.filterAll();
    this.enc_zipcode.filterAll();
    this.enc_tags.filterAll();
    this.enc_eid_det.filterAll();
    encounters_cf.remove();
    encounters_cf.add(data.encounters);

    rel_eid_p.filterAll();
    rel_tid_p.filterAll();
    this.rel_tid_cg.filterAll();
    this.rel_tid.filterAll();
    relations_cf.remove();
    relations_cf.add(data.relations);

    this.topics_tid.filterAll();
    this.topics_cat.filterAll();
    this.topics_sys.filterAll();

    this.currentEncounters = dimCollect(this.enc_eid);
    this.currentTopics = dimCollect(this.topics_tid);

    this.numActiveEncounters = this.currentEncounters.size;
    this.numActiveRelations = this.currentTopics.size;

  },

  addDetector(d) {
    let cf = crossfilter();
    let detector = {
      name: d.name,
      cf: cf,
      eid: cf.dimension(d => d.id),
      prob: cf.dimension(d => d.prob),
      similar: cf.dimension(d => d.similar)
    };
    detector.eid.cf = cf;
    detector.eid.name = 'detector';
    detector.prob.cf = cf;
    detector.prob.name = 'detector';
    detector.similar.cf = cf;
    detector.similar.name = 'detector';
    detectors.set(detector.name, detector);

    return detector;
  },

  update(dimension) {
    let t = Date.now(); // performance measurement
    let collection;

    /* encounters */
    if (dimension.name === 'encounters') {
      collection = groupCollect(enc_eid);
      el_eid_p.filter(e => collection.has(e));

      collection = groupCollect(rel_tid_p);
      this.topics_tid.filter(t => collection.has(t));

      collection = groupCollect(this.enc_eid_det);
      detectors.forEach(detector => {
        detector.eid.filter(e => collection.has(e))
      });
    }

    /* topics */
    else if (dimension.name == 'topics') {
      collection = groupCollect(topics_tid);
      rel_tid_p.filter(t => collection.has(t));

      collection = groupCollect(rel_eid_p);
      this.enc_eid.filter(e => collection.has(e));

      collection = groupCollect(this.enc_eid_det);
      detectors.forEach(detector => {
        detector.eid.filter(e => collection.has(e))
      });
    }

    /* detectors */
    else if (dimension.name == 'detector') {
      collection = groupCollect(dimension);
      this.enc_eid_det.filter(e => collection.has(e));

      collection = dimCollect(this.enc_eid);
      rel_eid_p.filter(e => collection.has(e));

      collection = groupCollect(rel_tid_p);
      this.topics_tid.filter(t => collection.has(t));
    }

    /* relations */
    else if (dimension.name == 'relations') {
      collection = groupCollect(rel_tid_p);
      this.topics_tid.filter(t => collection.has(t));

      collection = groupCollect(rel_eid_p);
      this.enc_eid.filter(e => collection.has(e));

      collection = groupCollect(this.enc_eid_det);
      detectors.forEach(detector => {
        detector.eid.filter(e => collection.has(e))
      });
    }

    this.currentEncounters = dimCollect(this.enc_eid);
    this.currentTopics = dimCollect(this.topics_tid);

    this.numActiveEncounters = this.currentEncounters.size;
    this.numActiveRelations = this.currentTopics.size;
    //console.log('patient update [',dimension.name,'] in ', Date.now()-t,'msec  enc:',currentEncounters.size, 'topics:', currentTopics.size);
  }

};


function setup(data) {
  patients.fromDate = data.from;
  patients.toDate = data.to;

  let from = d3.timeDay.ceil(dateParse(patients.fromDate)),
    to = d3.timeDay.offset(d3.timeDay.ceil(dateParse(patients.toDate)), 1);

  patients.datesRange = d3.timeDay.range(from, to);
  patients.datesScale
    .domain([from, to])
    .rangeRound([0, patients.datesRange.length]);


  patients.encounters = data.encounters;
  patients.relations = data.relations;

  patients.encountersMap.clear();
  patients.encounters.forEach(e => {
    e.tags = new Set();
    e.day = patients.datesScale(e.date);
    patients.encountersMap.set(e.id, e)
  });

  patients.relations.forEach(r => patients.encountersMap.get(r.enc_id).tags.add(r.tag_id));
}

patients.enc_eid_det.collect = patients.enc_eid_det.group();
patients.tag_enc_group = patients.rel_tid_cg.group().reduce(
  //(p,v) => { p.push(v); return p; },
  //(p,v) => { p.splice(p.indexOf(v), 1); return p; },
  //() => []);
  (p, v) => { p.add(v); return p; },
  (p, v) => { p.delete(v); return p; },
  () => { return new Set();  });

export default patients;