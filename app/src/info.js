define(['exports', 'module', './services/data', './components/table', './components/chart', 'postal'], function (exports, module, _servicesData, _componentsTable, _componentsChart, _postal) {
  /**
   * Created by yarden on 7/21/15.
   */

  'use strict';

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  //import * as $ from 'jquery'
  //import 'bootstrap-multiselect'

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var selection = undefined;

    var tagsTable = (0, _componentsTable)().el('#tags-table').columns([{ title: 'Tag', name: 'name' }, 'n']);

    var selectedTable = (0, _componentsTable)().el('#selected-table').columns([{ title: 'Selected', name: 'name' }, 'n']);

    var categoryTable = (0, _componentsTable)().el('#category-table').columns(['category', 'n']);

    var systemTable = (0, _componentsTable)().el('#system-table').columns(['system', 'n']);

    var summaryChart = (0, _componentsChart)().el('#summary-chart');
    var selectedChart = (0, _componentsChart)().el('#selected-chart');

    var charts = new Map([['#summary-chart', summaryChart], ['#selected-chart', selectedChart]]);

    function init() {
      _postal.subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

      d3.select('#pathogens').on('change', selectPathogen);

      d3.select('#pathogens').selectAll('option').data(_servicesData.pathogens).enter().append('option').attr('value', function (d) {
        return d.name;
      }).text(function (d) {
        return d.name;
      });

      //$('#pathogens').multiselect();
    }

    function selectPathogen() {
      console.log('pathogen ' + this.options[this.selectedIndex]);
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

      var selectedSeries = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = selection.tags()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          var bins = histogram(tag.items, range, scale);
          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'solid',
            values: bins
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = selection.excluded()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var tag = _step3.value;

          var bins = histogram(tag.items, range, scale);
          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'dash',
            values: bins
          });
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

      //selectedSeries.push({
      //  label: tag.concept.label,
      //  color: tag.color,
      //  type: 'line',
      //  values: histogram(selection.selectedItems(), range)
      //});

      selectedChart.data(selectedSeries);

      var selected = [];
      var categories = new Map();
      var systems = new Map();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = selection.tags()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tag = _step4.value;

          selected.push({ name: tag.concept.label, n: tag.items.length, tag: tag });

          var entry = categories.get(tag.concept.category);
          if (!entry) {
            entry = { category: tag.concept.category, n: 0 };
            categories.set(tag.concept.category, entry);
          }
          entry.n++;

          entry = systems.get(tag.concept.system);
          if (!entry) {
            entry = { system: tag.concept.system, n: 0 };
            systems.set(tag.concept.system, entry);
          }
          entry.n++;
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

      selectedTable.data(selected);
      categoryTable.data(toArray(categories.values()));
      systemTable.data(toArray(systems.values()));
    }

    function toArray(iter) {
      var a = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = iter[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var entry = _step5.value;

          a.push(entry);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return a;
    }
    function histogram(items, range, scale) {
      var bins = range.map(function (day) {
        return { date: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = items[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var item = _step6.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return bins;
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
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = charts[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _step7$value = _slicedToArray(_step7.value, 2);

          var name = _step7$value[0];
          var chart = _step7$value[1];

          var w = parseInt(d3.select(name).style('width'));
          var h = parseInt(d3.select(name).style('height'));
          chart.resize([w, h]);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7['return']) {
            _iterator7['return']();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return this;
    };

    return api;
  };
});

//# sourceMappingURL=info.js.map