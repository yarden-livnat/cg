define(['exports', 'module', 'd3', 'postal', './config', './data', './components/table', './components/n-table', './components/chart'], function (exports, module, _d3, _postal, _config, _data, _componentsTable, _componentsNTable, _componentsChart) {
  /**
   * Created by yarden on 7/21/15.
   */

  'use strict';

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var dateFormat = _d3.time.format('%Y-%m-%d');

    var selection = undefined;

    var tagsTable = (0, _componentsNTable)('#details-tables', 'tags-table').header([{ name: 'name', title: 'Tag' }, { name: 'act', attr: 'numeric' }, { name: 'num', attr: 'numeric' }]);

    var categoryTable = (0, _componentsNTable)('#details-tables', 'category-table').header([{ name: 'category' }, { name: 'num', attr: 'numeric' }]);

    var systemTable = (0, _componentsNTable)('#details-tables', 'system-table').header([{ name: 'system' }, { name: 'num', attr: 'numeric' }]);

    var summaryChart = (0, _componentsChart)().el('#summary-chart');
    var selectedChart = (0, _componentsChart)().el('#selected-chart');

    var charts = new Map([['#summary-chart', summaryChart], ['#selected-chart', selectedChart]]);

    var pathogens = new Map();

    var detectors = [];

    function init() {
      _postal.subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });

      /* pathogens */
      var items = _d3.select('#pathogens').select('ul').selectAll('li').data(_data.pathogens).enter().append('li');

      items.append('input').attr('type', 'checkbox').attr('value', function (d) {
        return d.name;
      }).on('change', function () {
        selectPathogen(this.value, this.checked);
      });

      items.append('span').text(function (d) {
        return d.name;
      });

      var menu = _d3.select('#pathogens .items');
      _d3.select('#pathogens').select('.anchor').on('click', function () {
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
      _d3.select('#detectors-charts').selectAll('div').data(_data.detectors).enter().append('div').attr('id', function (d) {
        return 'detector-' + d.name;
      });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.detectors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var d = _step.value;

          var c = (0, _componentsChart)().el('#detector-' + d.name).title(d.name).scale(_d3.scale.linear());
          var detector = { name: d.name, chart: c, data: [] };
          detectors.push(detector);
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
      tagsTable.data(_data.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          act: tag.items.length,
          num: tag.items.length
        };
      }));

      summaryChart.data(binData(_data.domain));

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

      _data.fetch('detectors', detectors.map(function (d) {
        return d.name;
      }), _data.fromDate, _data.toDate).then(function (d) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = d[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var entry = _step3.value;

            var detector = undefined;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = detectors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                detector = _step4.value;

                if (detector.name == entry.name) break;
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

            detector.data = entry.rows;
            //detector.data.sort( d => d.id );
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

        updateDetectors();
      })['catch'](function (e) {
        console.error('Detectors error:', e);
      });
    }

    function binData(items) {
      var f = _d3.time.day.ceil(_data.fromDate),
          t = _d3.time.day.offset(_d3.time.day.ceil(_data.toDate), 1),
          range = _d3.time.day.range(f, t),
          scale = _d3.time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { x: day, value: 0, items: [] };
      });
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = items[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var item = _step5.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
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

      return [{ label: 'data', color: 'black', values: bins }];
    }

    function selectionChanged() {
      updateCharts();
      updateTables();
      updateSelectionList();
    }

    function updateCharts() {
      var from = _d3.time.day.ceil(_data.fromDate),
          to = _d3.time.day.offset(_d3.time.day.ceil(_data.toDate), 1),
          range = _d3.time.day.range(from, to),
          scale = _d3.time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var selectedSeries = [];

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = selection.tags()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var tag = _step6.value;

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

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = selection.excluded()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var tag = _step7.value;

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

      //selectedSeries.push({
      //  label: tag.concept.label,
      //  color: tag.color,
      //  type: 'line',
      //  values: histogram(selection.selectedItems(), range)
      //});

      selectedChart.data(selectedSeries);
    }

    function updateTables() {
      var categories = new Map();
      var systems = new Map();
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = selection.tags()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var tag = _step8.value;

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

      tagsTable.data(_data.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          act: selection.countActive(tag.items),
          num: tag.items.length
        };
      }));

      mark(selection.tags(), { selected: true, excluded: false });
      mark(selection.excluded(), { selected: false, excluded: true });

      categoryTable.data(toArray(categories.values()));
      systemTable.data(toArray(systems.values()));
    }

    function updateSelectionList() {
      var tag = undefined,
          list = [];
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = selection.tags()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          tag = _step9.value;

          list.push({ name: tag.concept.label, attr: 'selected' });
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
        for (var _iterator10 = selection.excluded()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          tag = _step10.value;

          list.push({ name: tag.concept.label, attr: 'excluded' });
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

      var s = _d3.select('#selection-list').selectAll('li').data(list);

      s.enter().append('li');
      s.text(function (d) {
        return d.name;
      }).attr('class', function (d) {
        return d.attr;
      });
      s.exit().remove();
    }

    function mark(list, markers) {
      var s = new Set();
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = list[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var tag = _step11.value;
          s.add(tag.concept.label);
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

      tagsTable.row(function (d) {
        return s.has(d.name);
      }).selectAll(':first-child').classed(markers);
    }

    function selectPathogen(name, show) {
      if (show) {
        var div = _d3.select('#pathogens-charts').append('div').attr('id', 'chart-' + name);
        var c = (0, _componentsChart)().el(div).title(name);
        pathogens.set(name, c);
        updatePathogens(name);
      } else {
        _d3.select('#pathogens-charts').select('#chart-' + name).remove();
        pathogens['delete'](name);
      }
    }

    function updatePathogens(names) {
      var from = _d3.time.day.offset(_d3.time.month.offset(_data.toDate, -_config.pathogens_duration), 1);
      var to = _data.toDate;
      var range = _d3.time.day.range(from, to);
      var scale = _d3.time.scale().domain([from, to]).rangeRound([0, range.length - 1]);

      _data.fetch('pathogens', [names], from, _data.toDate).then(function (d) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = d[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var entry = _step12.value;

            var positive = range.map(function (d) {
              return { x: d, value: 0, items: [] };
            });
            var negative = range.map(function (d) {
              return { x: d, value: 0, items: [] };
            });

            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
              for (var _iterator13 = entry.rows[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var item = _step13.value;

                item.date = dateFormat.parse(item.date);
                var i = scale(item.date);
                var bins = item.positive ? positive : negative;
                bins[i].value++;
                bins[i].items.push(item);
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
      })['catch'](function (reason) {
        console.error('error: ', reason);
      });
    }

    function updateDetectors() {
      var domain = selection.domain; // check that it is sorted by id
      var n = domain.length;

      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = detectors[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var detector = _step14.value;

          var prob = [],
              similar = [];
          var i = 0;
          for (var j = 0; j < 100; j++) {
            prob.push({ x: j / 100, value: 0, items: [] });
            similar.push({ x: j / 100, value: 0, items: [] });
          }

          var found = 0;
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = detector.data[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var entry = _step15.value;

              while (i < n && domain[i].id < entry.id) i++;
              if (i == n) break;
              if (domain[i].id == entry.id) {
                found++;
                var p = prob[Math.min(Math.floor(entry.prob * 100), 99)];
                p.value++;
                p.items.push(entry);

                var s = similar[Math.min(Math.floor(entry.similar * 100), 99)];
                s.value++;
                s.items.push(entry);

                i++;
              }
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
    }

    function toArray(iter) {
      var a = [];
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = iter[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var entry = _step16.value;

          a.push(entry);
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

      return a;
    }
    function histogram(items, range, scale) {
      var bins = range.map(function (d) {
        return { x: d, value: 0, items: [] };
      });
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = items[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var item = _step17.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17['return']) {
            _iterator17['return']();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
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
      var name = undefined,
          c = undefined;
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = charts[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var _step18$value = _slicedToArray(_step18.value, 2);

          name = _step18$value[0];
          c = _step18$value[1];

          var w = parseInt(_d3.select(name).style('width'));
          var _h = parseInt(_d3.select(name).style('height'));
          c.resize([w, _h]);
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18['return']) {
            _iterator18['return']();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      var _iteratorNormalCompletion19 = true;
      var _didIteratorError19 = false;
      var _iteratorError19 = undefined;

      try {
        for (var _iterator19 = pathogens[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
          var _step19$value = _slicedToArray(_step19.value, 2);

          name = _step19$value[0];
          c = _step19$value[1];

          var w = parseInt(_d3.select('#chart-' + name).style('width'));
          var _h2 = parseInt(_d3.select('#chart-' + name).style('height'));
          c.resize([w, _h2]);
        }
      } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion19 && _iterator19['return']) {
            _iterator19['return']();
          }
        } finally {
          if (_didIteratorError19) {
            throw _iteratorError19;
          }
        }
      }

      var h = parseInt(_d3.select('#info-area').style('height')) - parseInt(_d3.select('#pathogens').style('height'));
      console.log('h = ', h);
      console.log('max = ', _d3.select('#pathogens-charts').style('max-height'));
      _d3.select('#pathogens-charts').style('max-height', h + 'px');
      return this;
    };

    return api;
  };
});

//# sourceMappingURL=info.js.map