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
  enc_eid.cf = encounters;
  var enc_date = encounters.dimension(function (d) {
    return d.date;
  });exports.enc_date = enc_date;
  enc_date.cf = encounters;
  var enc_zipcode = encounters.dimension(function (d) {
    return d.zipcode;
  });exports.enc_zipcode = enc_zipcode;
  enc_zipcode.cf = encounters;

  var topics = (0, _crossfilter2['default'])();
  var topics_tid = topics.dimension(function (d) {
    return d.id;
  });exports.topics_tid = topics_tid;
  topics_tid.cf = topics;
  var topics_cat = topics.dimension(function (d) {
    return d.category;
  });exports.topics_cat = topics_cat;
  topics_cat.cf = topics;
  var topics_sys = topics.dimension(function (d) {
    return d.system;
  });exports.topics_sys = topics_sys;
  topics_sys.cf = topics;

  var relations = (0, _crossfilter2['default'])();
  var rel_eid = relations.dimension(function (r) {
    return r.enc_id;
  });
  var rel_tid = relations.dimension(function (r) {
    return r.tag_id;
  });
  var rel_eid_g = rel_eid.group();
  var rel_tid_g = rel_tid.group();

  var detectors = new Map();

  function init(topics_) {
    topics.add(topics_);
  }

  function set(data) {
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
    var tid = new Set();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = rel_tid_g.top(Infinity)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var g = _step.value;

        tid.add(g.key);
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
    if (dimension.cf === encounters) {
      var currentEncounters = enc_eid.top(Infinity);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = detectors.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var detector = _step2.value;
          detector.eid.filter(currentEncounters);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      rel_eid.filter(currentEncounters);

      var currentTopics = rel_tid.top(Infinity);
      topics_tid.filter(currentTopics);

      updateTags();
    } else if (dimension.cf == topics) {
      (function () {
        rel_tid.filter(dimension.top(Infinity));
        enc_eid.filter(rel_eid.top(Infinity));
        var activeEncounters = enc_eid.top(Infinity);
        detectors.forEach(function (detector) {
          detector.eid.filter(activeEncounters);
        });

        updateTags();
        //} else if ( /* is a detector */) {
        //
        //} else { /* it's a tags action */
      })();
    }
  }
});

//# sourceMappingURL=patients.js.map