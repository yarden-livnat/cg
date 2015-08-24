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
  var rel_tid = relations_cf.dimension(function (r) {
    return r.tag_id;
  });exports.rel_tid = rel_tid;
  rel_tid.name = 'relations';

  var detectors = new Map();

  function collect(dim) {
    return dim.group().top(Infinity).reduce(function (p, v) {
      return v.value ? p.add(v.key) : p;
    }, new Set());
  }

  function setup(data) {
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

  function init(topics_) {
    topics.add(topics_);
  }

  function set(data) {
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

    var tid = collect(rel_tid);
    topics_tid.filter(function (t) {
      return tid.has(t);
    });
  }

  function updateTags() {
    console.log('update tags');
  }

  function addDetector(name) {
    var cf = (0, _crossfilter2['default'])();
    var detector = { name: name, cf: cf, eid: cf.dimension(function (d) {
        return d.eid;
      }), prob: cf.dimension(function (d) {
        return d.prob;
      }) };
    detector.eid.cf = cf;
    detector.prob.cf = cf;
    detectors.set(name, detector);

    // todo: what to return?
  }

  function update(dimension) {
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

        //for (let detector of detectors.values()) detector.eid.filter(currentEncounters);
        updateTags();
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

        detectors.forEach(function (detector) {
          detector.eid.filter(function (e) {
            return currentEncounters.has(e);
          });
        });

        updateTags();
        //} else if ( /* is a detector */) {
        //
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
      })();
    }
  }
});

//# sourceMappingURL=patients.js.map