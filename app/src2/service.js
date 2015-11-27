define(['exports', 'd3', 'queue'], function (exports, _d3, _queue) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;
  exports.fetch = fetch;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _queue2 = _interopRequireDefault(_queue);

  var dateFormat = _d32['default'].time.format('%Y-%m-%d');

  var topics = [];
  exports.topics = topics;
  var topicsMap = new Map();
  exports.topicsMap = topicsMap;
  var pathogens = [];
  exports.pathogens = pathogens;
  var detectors = [];

  exports.detectors = detectors;

  function init(cb) {
    (0, _queue2['default'])().defer(_d32['default'].json, '/data/kb').defer(_d32['default'].json, '/info/pathogens').defer(_d32['default'].json, '/info/detectors').await(function (err, kb, pathogensList, detectorsList) {
      if (!err) {
        kb.forEach(function (d) {
          d.label = d.details == '' ? d.name : d.name + '[' + d.details + ']';
          topicsMap.set(d.id, d);
        });

        exports.topics = topics = kb;
        exports.pathogens = pathogens = pathogensList;
        exports.detectors = detectors = detectorsList;
      }
      cb(err);
    });
  }

  function fetch(type, names, from, to) {
    if (typeof names == 'string') names = [names];
    if (from instanceof Date) from = dateFormat(from);
    if (to instanceof Date) to = dateFormat(to);

    return new Promise(function (resolve, reject) {
      //startSpinner();
      _d32['default'].json('/' + type).header('Content-Type', 'application/json').post(JSON.stringify({ names: names, from: from, to: to }), function (error, data) {
        if (error) reject(error);else resolve(data);
      });
    });
  }
});

//# sourceMappingURL=service.js.map