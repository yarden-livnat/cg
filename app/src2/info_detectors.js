define(['exports', 'module', 'd3', 'postal', './config', './patients', './service', './components/detector'], function (exports, module, _d3, _postal, _config, _patients, _service, _componentsDetector) {
  /**
   * Created by yarden on 8/18/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _DetectorClass = _interopRequireDefault(_componentsDetector);

  module.exports = function () {

    var N_BINS = 20;
    var MIN_PROB = _config.DETECTOR_OPT.MIN_PROB;
    var PROB_RANGE = 1 - MIN_PROB;

    _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: dataChanged });
    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: render });

    var selection = undefined;
    var Detector = (0, _DetectorClass['default'])().minX(MIN_PROB);
    var detectors = [];
    var range = _d32['default'].range(MIN_PROB, 1, (1 - MIN_PROB) / N_BINS);
    var current = null;

    function elem(id) {
      return _d32['default'].select('#detectors').select('#detector-' + id);
    }

    function init(list) {
      detectors = list;
      detectors.forEach(function (d) {
        d.probGroup = d.prob.group(function (p) {
          return Math.floor((p - MIN_PROB) / PROB_RANGE * N_BINS);
        });
        d.similarGroup = d.similar.group(function (p) {
          return Math.floor((p - MIN_PROB) / PROB_RANGE * N_BINS);
        });
      });

      _d32['default'].select('#detectors').selectAll('div').data(list).enter().append('div').attr('id', function (d) {
        return 'detector-' + d.name;
      }).attr('class', 'detector').call(Detector.build);
      Detector.on('select', select);
      Detector.on('range', update);
    }

    function select(d) {
      if (current) Detector.select(elem(current.name), false);
      current = current != d ? d : null;
      if (current) Detector.select(elem(current.name), true);
      _postal2['default'].publish({ channel: 'detector', topic: 'changed', data: current && current.prob });
    }

    function update(ext) {
      if (!current) return;
      current.prob.filter(function (p) {
        return ext[0] <= p && p <= ext[1];
      });

      _patients.update(current.eid);
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
    }

    function dataChanged(data) {
      (0, _service.fetch)('detectors', detectors.map(function (d) {
        return d.name;
      }), data.from, data.to).then(function (reply) {
        for (var i = 0; i < reply.length; i++) {
          var detector = detectors[i];
          var _data = reply[i];
          detector.eid.filterAll();
          detector.prob.filterAll();
          detector.similar.filterAll();
          detector.cf.remove();
          detector.cf.add(_data.rows);
        }
        render();
      })['catch'](function (e) {
        console.error('Detectors error:', e);
      });
    }

    function render() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function () {
          var detector = _step.value;

          var hist = range.map(function (d) {
            return { x: d, p: 0, s: 0 };
          });

          detector.probGroup.all().forEach(function (d) {
            if (d.key >= 0) hist[d.key].p = d.value;
          });
          //detector.similarGroup.all().forEach( d => { if (d.key >= 0) hist[d.key].s = d.value; });
          detector.data = hist;
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

      Detector(_d32['default'].select('#detectors').selectAll('.detector'));
    }

    return {
      init: init
    };
  };
});

//# sourceMappingURL=info_detectors.js.map