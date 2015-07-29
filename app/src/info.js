define(['exports', 'module', 'services/data', 'components/table', 'components/chart', 'postal'], function (exports, module, _servicesData, _componentsTable, _componentsChart, _postal) {
  /**
   * Created by yarden on 7/21/15.
   */

  'use strict';

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var selection = undefined;

    var tagsTable = (0, _componentsTable)().el(d3.select('#tags-table')).columns([{ title: 'Tag', name: 'name' }, 'n']);

    var summaryChart = (0, _componentsChart)().el('#summary-chart');
    var selectedChart = (0, _componentsChart)().el('#selected-chart');
    var currentChart = (0, _componentsChart)().el('#current-chart');

    var charts = new Map([['#summary-chart', summaryChart], ['#selected-chart', selectedChart], ['#current-chart', currentChart]]);

    function init() {
      _postal.subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });
    }

    function dataChanged() {
      tagsTable.data(_servicesData.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          n: tag.items.length
        };
      }));

      summaryChart.data(binData(_servicesData.domain));
    }

    function binData(items) {
      var f = d3.time.day.ceil(_servicesData.fromDate),
          t = d3.time.day.offset(d3.time.day.ceil(_servicesData.toDate), 1),
          range = d3.time.day.range(f, t),
          scale = d3.time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { date: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
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

      return [{ label: 'data', color: 'black', values: bins }];
    }

    function selectionChanged() {
      var from = d3.time.day.ceil(_servicesData.fromDate),
          to = d3.time.day.offset(d3.time.day.ceil(_servicesData.toDate), 1),
          range = d3.time.day.range(from, to),
          scale = d3.time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var domain = new Set(selection.domain);
      var selectedSeries = [];
      var currentSeries = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = selection.tags()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          var selectedBins = range.map(function (day) {
            return { date: day, value: 0, items: [] };
          });
          var currentBins = range.map(function (day) {
            return { date: day, value: 0, items: [] };
          });

          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = tag.items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var item = _step3.value;

              var i = scale(item.date);
              selectedBins[i].value++;
              selectedBins[i].items.push(item);

              if (domain.has(item)) {
                currentBins[i].value++;
                currentBins[i].items.push(item);
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                _iterator3['return']();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            values: selectedBins
          });

          currentSeries.push({
            label: tag.concept.label,
            color: tag.color,
            values: currentBins
          });
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

      selectedChart.data(selectedSeries);
      currentChart.data(currentSeries);
    }

    var api = {};

    api.init = function () {
      init();
      return this;
    };

    api.selection = function (s) {
      selection = s;
      selection.on('changed', selectionChanged);
      return this;
    };

    api.resize = function () {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = charts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _step4$value = _slicedToArray(_step4.value, 2);

          var name = _step4$value[0];
          var chart = _step4$value[1];

          var w = parseInt(d3.select(name).style('width'));
          var h = parseInt(d3.select(name).style('height'));
          chart.resize([w, h]);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return this;
    };

    return api;
  };
});

//# sourceMappingURL=info.js.map