define(['exports', 'module', 'd3', 'postal', '../data', '../components/detector'], function (exports, module, _d3, _postal, _data, _componentsDetector) {
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

    _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

    var _selection = undefined;
    var detector = (0, _Detector['default'])();
    var detectorsData = [];
    var range = _d32['default'].range(0.5, 1, 0.5 / N_BINS);

    function _init() {
      _d32['default'].select('#detectors').selectAll('div').data(_data.detectors).enter().append('div').attr('id', function (d) {
        return 'detector-' + d.name;
      }).attr('class', 'detector').call(detector.build);
    }

    function dataChanged() {
      _data.fetch('detectors', _data.detectors.map(function (d) {
        return d.name;
      }), _data.fromDate, _data.toDate).then(function (reply) {
        detectorsData = reply;
        update();
      })['catch'](function (e) {
        console.error('Detectors error:', e);
      });
    }

    function update() {
      var domain = _selection.domainMap;

      var list = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = detectorsData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var d = _step.value;

          var hist = range.map(function (d) {
            return { x: d, p: 0, s: 0 };
          });

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = d.rows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var r = _step2.value;

              if (domain.has(r.id)) {
                if (r.prob > 0.5) {
                  hist[Math.min(Math.floor((r.prob - 0.5) / 0.5 * N_BINS), N_BINS - 1)].p++;
                }
                if (r.similar > 0.5) {
                  hist[Math.min(Math.floor((r.similar - 0.5) / 0.5 * N_BINS), N_BINS - 1)].s++;
                }
              }
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

          list.push({ id: d.name, data: hist });
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

      console.log('detectors:', list);
      detector(_d32['default'].select('#detectors').selectAll('.detector').data(list));
    }

    return {
      init: function init() {
        _init();
      },

      selection: function selection(s) {
        _selection = s;
        _selection.on('changed.info.detectors', update);
        return this;
      }
    };
  };
});

//# sourceMappingURL=info_detectors.js.map