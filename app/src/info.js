define(['exports', 'module', 'd3', 'postal', './config', './data', './components/table', './components/chart'], function (exports, module, _d3, _postal, _config, _data, _componentsTable, _componentsChart) {
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

    var dateFormat = _d3.time.format('%Y-%m-%d');

    var selection = undefined;

    var tagsTable = (0, _componentsTable)().el('#tags-table').columns([{ title: 'Tag', name: 'name' }, 'n']);

    var selectedTable = (0, _componentsTable)().el('#selected-table').columns([{ title: 'Selected', name: 'name' }, 'n']);

    var categoryTable = (0, _componentsTable)().el('#category-table').columns(['category', 'n']);

    var systemTable = (0, _componentsTable)().el('#system-table').columns(['system', 'n']);

    var summaryChart = (0, _componentsChart)().el('#summary-chart');
    var selectedChart = (0, _componentsChart)().el('#selected-chart');

    var charts = new Map([['#summary-chart', summaryChart], ['#selected-chart', selectedChart]]);

    var pathogens = new Map();

    function init() {
      _postal.subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

      _d3.select('#pathogens').on('change', selectPathogen);

      _d3.select('#pathogens').selectAll('option').data(_data.pathogens).enter().append('option').attr('value', function (d) {
        return d.name;
      }).text(function (d) {
        return d.name;
      });

      //$('#pathogens').multiselect();
    }

    function selectPathogen() {
      var id = 'chart-' + this.value;
      if (pathogens.has(this.value)) {
        pathogens['delete'](this.value);
        _d3.select('#pathogens-area').select('#chart-' + this.value).remove();
      } else {
        var div = _d3.select('#pathogens-area').append('div').attr('id', 'chart-' + this.value);
        var c = (0, _componentsChart)().el(div).title(this.value);
        pathogens.set(this.value, c);
        updatePathogens(this.value);
      }
    }

    function updatePathogens(names) {
      var from = _d3.time.day.offset(_d3.time.month.offset(_data.toDate, -_config.pathogens_duration), 1);
      var to = _data.toDate;
      var range = _d3.time.day.range(from, to);
      var scale = _d3.time.scale().domain([from, to]).rangeRound([0, range.length - 1]);

      _data.fetchPathogens([names], from, _data.toDate).then(function (d) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = d[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var entry = _step.value;

            var positive = range.map(function (d) {
              return { date: d, value: 0, items: [] };
            });
            var negative = range.map(function (d) {
              return { date: d, value: 0, items: [] };
            });

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = entry.rows[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var item = _step2.value;

                item.date = dateFormat.parse(item.date);
                var i = scale(item.date);
                var bins = item.positive ? positive : negative;
                bins[i].value++;
                bins[i].items.push(item);
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

            var series = [{
              label: 'positive',
              color: 'red',
              type: 'line',
              marker: 'solid',
              values: positive
              //}
              //{
              //  label: 'negative',
              //  color: 'green',
              //  type: 'line',
              //  marker: 'solid',
              //  values: negative
            }];
            pathogens.get(entry.name).data(series);
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
      })['catch'](function (reason) {
        console.error('error: ', reason);
      });
    }

    function dataChanged() {
      tagsTable.data(_data.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          n: tag.items.length
        };
      }));

      summaryChart.data(binData(_data.domain));
    }

    function binData(items) {
      var f = _d3.time.day.ceil(_data.fromDate),
          t = _d3.time.day.offset(_d3.time.day.ceil(_data.toDate), 1),
          range = _d3.time.day.range(f, t),
          scale = _d3.time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { date: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var item = _step3.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
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

      return [{ label: 'data', color: 'black', values: bins }];
    }

    function selectionChanged() {
      var from = _d3.time.day.ceil(_data.fromDate),
          to = _d3.time.day.offset(_d3.time.day.ceil(_data.toDate), 1),
          range = _d3.time.day.range(from, to),
          scale = _d3.time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var selectedSeries = [];

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = selection.tags()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tag = _step4.value;

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

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = selection.excluded()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var tag = _step5.value;

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
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = selection.tags()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var tag = _step6.value;

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

      selectedTable.data(selected);
      categoryTable.data(toArray(categories.values()));
      systemTable.data(toArray(systems.values()));
    }

    function toArray(iter) {
      var a = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = iter[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var entry = _step7.value;

          a.push(entry);
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

      return a;
    }
    function histogram(items, range, scale) {
      var bins = range.map(function (d) {
        return { date: d, value: 0, items: [] };
      });
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = items[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var item = _step8.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8['return']) {
            _iterator8['return']();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
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
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = charts[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var _step9$value = _slicedToArray(_step9.value, 2);

          var _name = _step9$value[0];
          var _chart = _step9$value[1];

          var w = parseInt(_d3.select(_name).style('width'));
          var h = parseInt(_d3.select(_name).style('height'));
          _chart.resize([w, h]);
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9['return']) {
            _iterator9['return']();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = pathogens[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var _step10$value = _slicedToArray(_step10.value, 2);

          var _name2 = _step10$value[0];
          var _chart2 = _step10$value[1];

          var w = parseInt(_d3.select(_name2).style('width'));
          var h = parseInt(_d3.select(_name2).style('height'));
          _chart2.resize([w, h]);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10['return']) {
            _iterator10['return']();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      return this;
    };

    return api;
  };
});

//# sourceMappingURL=info.js.map