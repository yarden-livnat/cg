define(['exports', 'module', 'd3', 'postal', '../config', '../data', '../components/chart', '../components/chart3'], function (exports, module, _d3, _postal, _config, _data, _componentsChart, _componentsChart3) {
  /**
   * Created by yarden on 8/6/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _chart = _interopRequireDefault(_componentsChart);

  var _chart3 = _interopRequireDefault(_componentsChart3);

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var dateFormat = _d32['default'].time.format('%Y-%m-%d');

    var _selection = undefined;
    var summaryData = [];
    var summaryChart = (0, _chart3['default'])('#summary-chart', true);
    //let selectedChart = chart().el('#selected-chart');

    var pathogensTimeFormat = _d32['default'].time.format.multi([['%b %d', function (d) {
      return d.getDate() != 1;
    }], ['%B', function (d) {
      return d.getMonth();
    }]]);

    var pathogens_scale = _d32['default'].time.scale().nice(_d32['default'].time.week, 1);
    pathogens_scale.tickFormat(_d32['default'].format('%b %d'));
    pathogens_scale.ticks(_d32['default'].time.week, 1);

    var charts = new Map([['#summary-chart', summaryChart]]);

    var pathogens = new Map();

    function _init() {
      _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

      /* pathogens */
      var items = _d32['default'].select('#pathogens-selection').select('ul').selectAll('li').data(_data.pathogens).enter().append('li');

      items.append('input').attr('type', 'checkbox').attr('value', function (d) {
        return d.name;
      }).on('change', function () {
        selectPathogen(this.value, this.checked);
      });

      items.append('span').text(function (d) {
        return d.name;
      });

      var menu = _d32['default'].select('#pathogens-selection .items');
      _d32['default'].select('#pathogens-selection').select('.anchor').on('click', function () {
        if (menu.classed('visible')) {
          menu.classed('visible', false).style('display', 'none');
        } else {
          menu.classed('visible', true).style('display', 'block');
        }
      });

      menu.on('blur', function () {
        menu.classed('visible', false).style('display', 'none');
      });
    }

    function dataChanged() {
      var f = _d32['default'].time.day.ceil(_data.fromDate),
          t = _d32['default'].time.day.offset(_d32['default'].time.day.ceil(_data.toDate), 1),
          range = _d32['default'].time.day.range(f, t),
          scale = _d32['default'].time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { x: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.domain[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

      summaryData = [{ label: 'data', color: 'black', values: bins, right: true }];
      summaryChart.data(summaryData);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = pathogens.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _name = _step2.value;
          updatePathogens(_name);
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
    }

    function selectionChanged() {
      var from = _d32['default'].time.day.ceil(_data.fromDate),
          to = _d32['default'].time.day.offset(_d32['default'].time.day.ceil(_data.toDate), 1),
          range = _d32['default'].time.day.range(from, to),
          scale = _d32['default'].time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var selectedSeries = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _selection.selected()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var tag = _step3.value;

          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'solid',
            values: histogram(tag.items, range, scale)
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _selection.excluded()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var tag = _step4.value;

          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'dash',
            values: histogram(tag.items, range, scale)
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

      //selectedSeries.push({
      //  label: tag.concept.label,
      //  color: tag.color,
      //  type: 'line',
      //  values: histogram(selection.selectedItems(), range)
      //});

      //selectedChart.data(selectedSeries);

      selectedSeries.push(summaryData[0]);
      summaryChart.data(selectedSeries);
    }

    function selectPathogen(name, show) {
      if (show) {
        var div = _d32['default'].select('#pathogens').append('div').attr('id', 'chart-' + name);
        var x = _d32['default'].time.scale().nice(_d32['default'].time.week, 1);
        x.tickFormat(_d32['default'].time.format('%m %d'));
        x.ticks(_d32['default'].time.week, 1);
        var c = (0, _chart3['default'])(div).title(name).xscale(x);

        pathogens.set(name, c);
        updatePathogens(name);
      } else {
        _d32['default'].select('#pathogens').select('#chart-' + name).remove();
        pathogens['delete'](name);
      }
    }

    function updatePathogens(names) {
      var from = _d32['default'].time.week(_d32['default'].time.day.offset(_d32['default'].time.month.offset(_data.toDate, -_config.pathogens_duration), 1));
      var to = _d32['default'].time.week.ceil(_data.toDate);
      var range = _d32['default'].time.week.range(from, to);

      var from_week = _d32['default'].time.weekOfYear(from);
      var from_year = from.getFullYear();

      _data.fetch('pathogens', [names], from, _data.toDate).then(function (d) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = d[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var entry = _step5.value;

            var positive = range.map(function (d) {
              return { x: d, value: 0, items: [] };
            });
            //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = entry.rows[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var item = _step6.value;

                if (item.positive) {
                  item.date = dateFormat.parse(item.date);
                  var i = _d32['default'].time.weekOfYear(item.date) + (item.date.getFullYear() - from_year) * 52 - from_week;
                  //let bins = item.positive ? positive : negative;
                  positive[i].value++;
                  positive[i].items.push(item);
                }
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

            var series = [{
              label: 'positive',
              color: 'red',
              type: 'line',
              marker: 'solid',
              interpolate: 'step-after',
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
      })['catch'](function (reason) {
        console.error('error: ', reason);
      });
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
        return { x: d, value: 0, items: [] };
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

    return {
      init: function init() {
        _init();
        return this;
      },

      selection: function selection(s) {
        _selection = s;
        _selection.on('changed.info.charts', selectionChanged);
        return this;
      },

      resize: function resize() {
        var name = undefined,
            c = undefined;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = charts[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var _step9$value = _slicedToArray(_step9.value, 2);

            name = _step9$value[0];
            c = _step9$value[1];

            var w = parseInt(_d32['default'].select(name).style('width'));
            var _h = parseInt(_d32['default'].select(name).style('height'));
            c.resize([w, _h]);
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

            name = _step10$value[0];
            c = _step10$value[1];

            var w = parseInt(_d32['default'].select('#chart-' + name).style('width'));
            var _h2 = parseInt(_d32['default'].select('#chart-' + name).style('height'));
            c.resize([w, _h2]);
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

        var h = parseInt(_d32['default'].select('#pathogens-area').style('height')) - parseInt(_d32['default'].select('#pathogens-selection').style('height'));
        _d32['default'].select('#pathogens').style('max-height', h + 'px');
        return this;
      }
    };
  };
});

//['#selected-chart', selectedChart],

//# sourceMappingURL=info-charts.js.map