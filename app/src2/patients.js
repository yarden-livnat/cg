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
  var currentEncounters = new Set();
  exports.currentEncounters = currentEncounters;
  var currentTopics = new Set();
  exports.currentTopics = currentTopics;
  var numActiveEncounters = 0;
  exports.numActiveEncounters = numActiveEncounters;
  var numActiveRelations = 0;

  exports.numActiveRelations = numActiveRelations;
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

  function groupCollect(dim) {
    if (!dim.collect) {
      dim.collect = dim.group();
    }
    return dim.collect.all().reduce(function (p, v) {
      return v.value ? p.add(v.key) : p;
    }, new Set());
  }

  function dimCollect(dim) {
    var set = new Set();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = dim.top(Infinity)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        set.add(item.id);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return set;
  }

  function update(dimension) {
    var t = Date.now(); // performance measurement
    var collection = undefined;

    /* encounters */
    if (dimension.name === 'encounters') {
      collection = groupCollect(enc_eid);
      rel_eid_p.filter(function (e) {
        return collection.has(e);
      });

      collection = groupCollect(rel_tid_p);
      topics_tid.filter(function (t) {
        return collection.has(t);
      });

      collection = groupCollect(enc_eid_det);
      detectors.forEach(function (detector) {
        detector.eid.filter(function (e) {
          return collection.has(e);
        });
      });
    }

    /* topics */
    else if (dimension.name == 'topics') {
      collection = groupCollect(topics_tid);
      rel_tid_p.filter(function (t) {
        return collection.has(t);
      });

      collection = groupCollect(rel_eid_p);
      enc_eid.filter(function (e) {
        return collection.has(e);
      });

      collection = groupCollect(enc_eid_det);
      detectors.forEach(function (detector) {
        detector.eid.filter(function (e) {
          return collection.has(e);
        });
      });
    }

    /* detectors */
    else if (dimension.name == 'detector') {
      collection = groupCollect(dimension);
      enc_eid_det.filter(function (e) {
        return collection.has(e);
      });

      collection = dimCollect(enc_eid);
      rel_eid_p.filter(function (e) {
        return collection.has(e);
      });

      collection = groupCollect(rel_tid_p);
      topics_tid.filter(function (t) {
        return collection.has(t);
      });
    }

    /* relations */
    else if (dimension.name == 'relations') {
      collection = groupCollect(rel_tid_p);
      topics_tid.filter(function (t) {
        return collection.has(t);
      });

      collection = groupCollect(rel_eid_p);
      enc_eid.filter(function (e) {
        return collection.has(e);
      });

      collection = groupCollect(enc_eid_det);
      detectors.forEach(function (detector) {
        detector.eid.filter(function (e) {
          return collection.has(e);
        });
      });
    }

    exports.currentEncounters = currentEncounters = dimCollect(enc_eid);
    exports.currentTopics = currentTopics = dimCollect(topics_tid);

    exports.numActiveEncounters = numActiveEncounters = currentEncounters.size;
    exports.numActiveRelations = numActiveRelations = currentTopics.size;
    console.log('patient update [', dimension.name, '] in ', Date.now() - t, '  enc:', currentEncounters.size, 'top:', currentTopics.size);
  }
});

//# sourceMappingURL=patients.js.map