define(['exports', 'crossfilter'], function (exports, _crossfilter) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;
  exports.set = set;
  exports.addDetector = addDetector;
  exports.update = update;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _crossfilter2 = _interopRequireDefault(_crossfilter);

  var fromDate = undefined;
  exports.fromDate = fromDate;
  var toDate = undefined;
  exports.toDate = toDate;
  var encounters = undefined;
  exports.encounters = encounters;
  var encountersMap = undefined;
  exports.encountersMap = encountersMap;
  var relations = undefined;

  exports.relations = relations;
  var encounters_cf = (0, _crossfilter2['default'])();
  var enc_eid = encounters_cf.dimension(function (d) {
    return d.id;
  });exports.enc_eid = enc_eid;
  enc_eid.name = 'encounters';
  var enc_date = encounters_cf.dimension(function (d) {
    return d.date;
  });exports.enc_date = enc_date;
  enc_date.name = 'encounters';
  var enc_zipcode = encounters_cf.dimension(function (d) {
    return d.zipcode;
  });exports.enc_zipcode = enc_zipcode;
  enc_zipcode.name = 'encounters';
  var enc_tags = encounters_cf.dimension(function (d) {
    return d.id;
  });exports.enc_tags = enc_tags;
  enc_tags.name = 'encounters';
  var enc_eid_det = encounters_cf.dimension(function (d) {
    return d.id;
  });exports.enc_eid_det = enc_eid_det;
  enc_eid.name = 'encounters';enc_eid_det.collect = enc_eid_det.group();

  var topics = (0, _crossfilter2['default'])();
  var topics_tid = topics.dimension(function (d) {
    return d.id;
  });exports.topics_tid = topics_tid;
  topics_tid.name = 'topics';
  var topics_cat = topics.dimension(function (d) {
    return d.category;
  });exports.topics_cat = topics_cat;
  topics_cat.name = 'topics';
  var topics_sys = topics.dimension(function (d) {
    return d.system;
  });exports.topics_sys = topics_sys;
  topics_sys.name = 'topics';

  var relations_cf = (0, _crossfilter2['default'])();
  var rel_eid_p = relations_cf.dimension(function (r) {
    return r.enc_id;
  });
  var rel_tid_p = relations_cf.dimension(function (r) {
    return r.tag_id;
  });

  var rel_tid_cg = relations_cf.dimension(function (r) {
    return r.tag_id;
  });exports.rel_tid_cg = rel_tid_cg;
  rel_tid_cg.name = 'relations';
  var tag_enc_group = rel_tid_cg.group().reduce(function (p, v) {
    p.push(v);return p;
  }, function (p, v) {
    p.splice(p.indexOf(v), 1);return p;
  }, function () {
    return [];
  });

  exports.tag_enc_group = tag_enc_group;
  function TagEnc(eid, tid) {
    this.eid = eid;
    this.tid = tid;
  }

  TagEnc.prototype.valueOf = function () {
    return this.tid;
  };

  var rel_tid = relations_cf.dimension(function (r) {
    return new TagEnc(r.enc_id, r.tag_id);
  });exports.rel_tid = rel_tid;
  rel_tid.name = 'relations';

  function setup(data) {
    exports.fromDate = fromDate = data.from;
    exports.toDate = toDate = data.to;

    exports.encounters = encounters = data.encounters;
    exports.relations = relations = data.relations;

    exports.encountersMap = encountersMap = new Map();
    encounters.forEach(function (e) {
      e.tags = new Set();
      encountersMap.set(e.id, e);
    });

    relations.forEach(function (r) {
      return encountersMap.get(r.enc_id).tags.add(r.tag_id);
    });
  }

  function init(_) {
    topics.add(_);
  }

  function set(data) {
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
  }

  /* detectors */

  var detectors = new Map();

  function addDetector(d) {
    var cf = (0, _crossfilter2['default'])();
    var detector = { name: d.name, cf: cf, eid: cf.dimension(function (d) {
        return d.id;
      }), prob: cf.dimension(function (d) {
        return d.prob;
      }), similar: cf.dimension(function (d) {
        return d.similar;
      }) };
    detector.eid.cf = cf;detector.eid.name = 'detector';
    detector.prob.cf = cf;detector.prob.name = 'detector';
    detector.similar.cf = cf;detector.similar.name = 'detector';
    detectors.set(detector.name, detector);

    return detector;
  }

  /* update */

  function collect(dim) {
    if (!dim.collect) {
      dim.collect = dim.group();
    }
    return dim.collect.all().reduce(function (p, v) {
      return v.value ? p.add(v.key) : p;
    }, new Set());
  }

  function update(dimension) {
    var t = Date.now(); // performance measure
    console.log('patients update:', dimension.name);
    if (dimension.name === 'encounters') {
      (function () {
        var currentEncounters = collect(enc_eid);
        rel_eid_p.filter(function (e) {
          return currentEncounters.has(e);
        });

        var currentTopics = collect(rel_tid_p);
        topics_tid.filter(function (t) {
          return currentTopics.has(t);
        });

        console.log('patients: enc:', currentEncounters.size, 'top:', currentTopics.size);
        var detEnc = collect(enc_eid_det);
        detectors.forEach(function (detector) {
          detector.eid.filter(function (e) {
            return detEnc.has(e);
          });
        });
      })();
    } else if (dimension.name == 'topics') {
      (function () {
        var currentTopics = collect(topics_tid);
        rel_tid_p.filter(function (t) {
          return currentTopics.has(t);
        });

        var currentEncounters = collect(rel_eid_p);
        enc_eid.filter(function (e) {
          return currentEncounters.has(e);
        });

        console.log('patients: enc:', currentEncounters.size, 'top:', currentTopics.size);

        var detEnc = collect(enc_eid_det);
        detectors.forEach(function (detector) {
          detector.eid.filter(function (e) {
            return detEnc.has(e);
          });
        });
      })();
    } else if (dimension.name == 'detector') {
      (function () {
        var detEnc = collect(dimension);
        enc_eid_det.filter(function (e) {
          return detEnc.has(e);
        });

        var currentEncounters = collect(enc_eid);
        rel_eid_p.filter(function (e) {
          return currentEncounters.has(e);
        });

        var currentTopics = collect(rel_tid_p);
        topics_tid.filter(function (t) {
          return currentTopics.has(t);
        });

        console.log('patients: enc:', currentEncounters.size, 'top:', currentTopics.size);
      })();
    } else if (dimension.name == 'relations') {
      (function () {
        var currentTopics = collect(rel_tid_p);
        topics_tid.filter(function (t) {
          return currentTopics.has(t);
        });

        var currentEncounters = collect(rel_eid_p);
        enc_eid.filter(function (e) {
          return currentEncounters.has(e);
        });

        console.log('patients: enc:', currentEncounters.size, 'top:', currentTopics.size);

        var detEnc = collect(enc_eid_det);
        detectors.forEach(function (detector) {
          detector.eid.filter(function (e) {
            return detEnc.has(e);
          });
        });
      })();
    }
    console.log('patient: update ', Date.now() - t);
  }
});

//# sourceMappingURL=patients.js.map