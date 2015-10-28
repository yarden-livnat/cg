define(['exports', 'module', 'd3', 'postal', './service', './components/detector'], function (exports, module, _d3, _postal, _service, _componentsDetector) {
  /**
   * Created by yarden on 8/18/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _Detector = _interopRequireDefault(_componentsDetector);

  module.exports = function () {

    var N_BINS = 20;

    _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: dataChanged });
    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: render });

    var selection = undefined;
    var detectorClass = (0, _Detector['default'])();
    var detectors = [];
    var detectorsData = [];
    var range = _d32['default'].range(0.5, 1, 0.5 / N_BINS);

    function init(list) {
      detectors = list;
      _d32['default'].select('#detectors').selectAll('div').data(list).enter().append('div').attr('id', function (d) {
        return 'detector-' + d.name;
      }).attr('class', 'detector').call(detectorClass.build);
    }

    function dataChanged(data) {
      (0, _service.fetch)('detectors', detectors.map(function (d) {
        return d.name;
      }), data.from, data.to).then(function (reply) {
        detectorsData = reply;
        for (var i = 0; i < reply.length; i++) {
          var detector = detectors[i];
          var _data = reply[i];
          detector.eid.filterAll();
          detector.prob.filterAll();
          detector.cf.remove();
          detector.cf.add(_data.rows);
        }
        render();
      })['catch'](function (e) {
        console.error('Detectors error:', e);
      });
    }

    function render() {
      var list = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function () {
          var detector = _step.value;

          var hist = range.map(function (d) {
            return { x: d, p: 0, s: 0 };
          });

          detector.prob.group(function (p) {
            return Math.floor((p - 0.5) / 0.5 * N_BINS);
          }).top(Infinity).forEach(function (d) {
            if (d.key >= 0) hist[d.key].p = d.value;
          });

          detector.similar.group(function (p) {
            return Math.floor((p - 0.5) / 0.5 * N_BINS);
          }).top(Infinity).forEach(function (d) {
            if (d.key >= 0) hist[d.key].s = d.value;
          });

          list.push({ id: detector.name, data: hist });
        };

        for (var _iterator = detectors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
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

      detectorClass(_d32['default'].select('#detectors').selectAll('.detector').data(list));
    }

    return {
      init: init
    };
  };
});

//import * as data from '../data'

//# sourceMappingURL=info_detectors.js.map