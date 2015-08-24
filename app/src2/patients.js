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

  var encounters = (0, _crossfilter2['default'])();
  var enc_eid = encounters.dimension(function (d) {
    return d.id;
  });exports.enc_eid = enc_eid;
  enc_eid.name = 'encounters';
  var enc_date = encounters.dimension(function (d) {
    return d.date;
  });exports.enc_date = enc_date;
  enc_date.name = 'encounters';
  var enc_zipcode = encounters.dimension(function (d) {
    return d.zipcode;
  });exports.enc_zipcode = enc_zipcode;
  enc_zipcode.name = 'encounters';

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

  var relations = (0, _crossfilter2['default'])();
  var rel_eid_p = relations.dimension(function (r) {
    return r.enc_id;
  });
  var rel_tid_p = relations.dimension(function (r) {
    return r.tag_id;
  });
  var rel_tid = relations.dimension(function (r) {
    return r.tag_id;
  });exports.rel_tid = rel_tid;
  rel_tid.name = 'relations';

  var rels = undefined;

  var detectors = new Map();

  function collect(dim) {
    return dim.group().top(Infinity).reduce(function (p, v) {
      return v.value ? p.add(v.key) : p;
    }, new Set());
  }

  function init(topics_) {
    topics.add(topics_);
  }

  function set(data) {
    enc_eid.filterAll();
    enc_date.filterAll();
    enc_zipcode.filterAll();
    encounters.remove();
    encounters.add(data.encounters);

    rel_eid_p.filterAll();
    rel_tid_p.filterAll();
    relations.remove();
    relations.add(data.relations);

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

        //for (let detector of detectors.values()) detector.eid.filter(currentEncounters);

        rel_eid_p.filter(function (e) {
          return currentEncounters.has(e);
        });

        var currentTopics = collect(rel_tid_p);
        topics_tid.filter(function (t) {
          return currentTopics.has(t);
        });

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