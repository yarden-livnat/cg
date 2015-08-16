define(['exports', 'module', 'd3', 'postal', '../config', '../data', '../components/chart', '../components/chart2'], function (exports, module, _d3, _postal, _config, _data, _componentsChart, _componentsChart2) {
  /**
   * Created by yarden on 8/6/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _chart = _interopRequireDefault(_componentsChart);

  var _chart2 = _interopRequireDefault(_componentsChart2);

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var dateFormat = _d32['default'].time.format('%Y-%m-%d');

    var _selection = undefined;
    var summaryData = [];
    var summaryChart = (0, _chart2['default'])('#summary-chart');
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

    var detectors = [];

    function _init() {
      _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

      /* pathogens */
      var items = _d32['default'].select('#pathogens').select('ul').selectAll('li').data(_data.pathogens).enter().append('li');

      items.append('input').attr('type', 'checkbox').attr('value', function (d) {
        return d.name;
      }).on('change', function () {
        selectPathogen(this.value, this.checked);
      });

      items.append('span').text(function (d) {
        return d.name;
      });

      var menu = _d32['default'].select('#pathogens .items');
      _d32['default'].select('#pathogens').select('.anchor').on('click', function () {
        if (menu.classed('visible')) {
          menu.classed('visible', false).style('display', 'none');
        } else {
          menu.classed('visible', true).style('display', 'block');
        }
      });

      menu.on('blur', function () {
        menu.classed('visible', false).style('display', 'none');
      });

      /* detectors */
      _d32['default'].select('#detectors-charts').selectAll('div').data(_data.detectors).enter().append('div').attr('id', function (d) {
        return 'detector-' + d.name;
      });

      detectors = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.detectors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var d = _step.value;

          detectors.set(d.name, {
            name: d.name,
            chart: (0, _chart2['default'])('#detector-' + d.name).title(d.name).xscale(_d32['default'].scale.linear()),
            data: []
          });
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
    }

    function dataChanged() {
      var f = _d32['default'].time.day.ceil(_data.fromDate),
          t = _d32['default'].time.day.offset(_d32['default'].time.day.ceil(_data.toDate), 1),
          range = _d32['default'].time.day.range(f, t),
          scale = _d32['default'].time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { x: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _data.domain[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          var i = scale(item.date);
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

      summaryData = [{ label: 'data', color: 'black', values: bins, right: true }];
      summaryChart.data(summaryData);

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = pathogens.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _name = _step3.value;
          updatePathogens(_name);
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

      var names = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = detectors.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var d = _step4.value;
          names.push(d.name);
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

      _data.fetch('detectors', names, _data.fromDate, _data.toDate).then(function (list) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = list[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var d = _step5.value;

            var detector = detectors.get(d.name);
            detector.data = new Map();
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = d.rows[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var r = _step6.value;

                detector.data.set(r.id, r);
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

        updateDetectors();
      })['catch'](function (e) {
        console.error('Detectors error:', e);
      });
    }

    function selectionChanged() {
      var from = _d32['default'].time.day.ceil(_data.fromDate),
          to = _d32['default'].time.day.offset(_d32['default'].time.day.ceil(_data.toDate), 1),
          range = _d32['default'].time.day.range(from, to),
          scale = _d32['default'].time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var selectedSeries = [];

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = _selection.selected()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var tag = _step7.value;

          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'solid',
            values: histogram(tag.items, range, scale)
          });
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

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = _selection.excluded()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var tag = _step8.value;

          selectedSeries.push({
            label: tag.concept.label,
            color: tag.color,
            type: 'line',
            marker: 'dash',
            values: histogram(tag.items, range, scale)
          });
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

      //selectedSeries.push({
      //  label: tag.concept.label,
      //  color: tag.color,
      //  type: 'line',
      //  values: histogram(selection.selectedItems(), range)
      //});

      //selectedChart.data(selectedSeries);

      selectedSeries.push(summaryData[0]);
      summaryChart.data(selectedSeries);

      updateDetectors();
    }

    function selectPathogen(name, show) {
      if (show) {
        var div = _d32['default'].select('#pathogens-charts').append('div').attr('id', 'chart-' + name);
        var x = _d32['default'].time.scale().nice(_d32['default'].time.week, 1);
        x.tickFormat(_d32['default'].time.format('%m %d'));
        x.ticks(_d32['default'].time.week, 1);
        var c = (0, _chart2['default'])(div).title(name).xscale(x);

        pathogens.set(name, c);
        updatePathogens(name);
      } else {
        _d32['default'].select('#pathogens-charts').select('#chart-' + name).remove();
        pathogens['delete'](name);
      }
    }

    function updatePathogens(names) {
      var from = _d32['default'].time.week(_d32['default'].time.day.offset(_d32['default'].time.month.offset(_data.toDate, -_config.pathogens_duration), 1));
      var to = _d32['default'].time.week.ceil(_data.toDate);
      var range = _d32['default'].time.week.range(from, to);

      var start = _d32['default'].time.weekOfYear(from);

      _data.fetch('pathogens', [names], from, _data.toDate).then(function (d) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = d[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var entry = _step9.value;

            var positive = range.map(function (d) {
              return { x: d, value: 0, items: [] };
            });
            //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
              for (var _iterator10 = entry.rows[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var item = _step10.value;

                if (item.positive) {
                  item.date = dateFormat.parse(item.date);
                  var i = _d32['default'].time.weekOfYear(item.date) - start;
                  //let bins = item.positive ? positive : negative;
                  positive[i].value++;
                  positive[i].items.push(item);
                }
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
      })['catch'](function (reason) {
        console.error('error: ', reason);
      });
    }

    function updateDetectors() {
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {

        for (var _iterator11 = detectors.values()[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var detector = _step11.value;

          var prob = [],
              similar = [];

          for (var j = 0; j < 100; j++) {
            prob.push({ x: j / 100, value: 0, items: [] });
            similar.push({ x: j / 100, value: 0, items: [] });
          }

          if (detector.data.size > 0) {
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
              for (var _iterator12 = _selection.domain[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var e = _step12.value;

                var entry = detector.data.get(e.id);
                if (entry == undefined || entry == null) {
                  console.log('[Detector] missing prob', e.id);
                } else {
                  var p = prob[Math.min(Math.floor(entry.prob * 100), 99)];
                  p.value++;
                  p.items.push(entry);

                  var s = similar[Math.min(Math.floor(entry.similar * 100), 99)];
                  s.value++;
                  s.items.push(entry);
                }
              }
            } catch (err) {
              _didIteratorError12 = true;
              _iteratorError12 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion12 && _iterator12['return']) {
                  _iterator12['return']();
                }
              } finally {
                if (_didIteratorError12) {
                  throw _iteratorError12;
                }
              }
            }
          }

          prob[0].value = 0;
          similar[0].value = 0;
          var series = [{
            label: 'prob',
            color: 'black',
            type: 'line',
            marker: 'solid',
            values: prob
          }, {
            label: 'similar',
            color: 'gray',
            type: 'line',
            marker: 'dash',
            values: similar
          }];
          detector.chart.data(series);
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11['return']) {
            _iterator11['return']();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }
    }

    function toArray(iter) {
      var a = [];
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = iter[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var entry = _step13.value;

          a.push(entry);
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13['return']) {
            _iterator13['return']();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      return a;
    }
    function histogram(items, range, scale) {
      var bins = range.map(function (d) {
        return { x: d, value: 0, items: [] };
      });
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = items[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var item = _step14.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14['return']) {
            _iterator14['return']();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
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
        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = charts[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var _step15$value = _slicedToArray(_step15.value, 2);

            name = _step15$value[0];
            c = _step15$value[1];

            var w = parseInt(_d32['default'].select(name).style('width'));
            var _h = parseInt(_d32['default'].select(name).style('height'));
            c.resize([w, _h]);
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15['return']) {
              _iterator15['return']();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }

        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = pathogens[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var _step16$value = _slicedToArray(_step16.value, 2);

            name = _step16$value[0];
            c = _step16$value[1];

            var w = parseInt(_d32['default'].select('#chart-' + name).style('width'));
            var _h2 = parseInt(_d32['default'].select('#chart-' + name).style('height'));
            c.resize([w, _h2]);
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16['return']) {
              _iterator16['return']();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        var h = parseInt(_d32['default'].select('#info-area').style('height')) - parseInt(_d32['default'].select('#pathogens').style('height'));
        _d32['default'].select('#pathogens-charts').style('max-height', h + 'px');
        return this;
      }
    };
  };
});

//['#selected-chart', selectedChart],

//# sourceMappingURL=info-charts.js.map