define(['exports', 'module', 'd3', 'postal', '../components/chart3', '../patients', '../tag_selection', '../service'], function (exports, module, _d3, _postal, _componentsChart3, _patients, _tag_selection, _service) {
  /**
   * Created by yarden on 8/6/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _chart3 = _interopRequireDefault(_componentsChart3);

  var MIN_Y = 5;
  var CHART_MAX_WIDTH = 500;

  module.exports = function () {
    var dateFormat = _d32['default'].time.format('%Y-%m-%d');
    var fromDate = undefined,
        toDate = undefined;

    var summaryData = [];
    var summaryChart = (0, _chart3['default'])('#summary-chart', true);

    var group = undefined;
    var selected = new Map();

    var charts = new Map([['#summary-chart', summaryChart]
    //['#selected-chart', selectedChart],
    ]);

    _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: dataChanged });
    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: render });

    function dataChanged(data) {
      fromDate = dateFormat.parse(data.from);
      toDate = dateFormat.parse(data.to);
    }

    function render() {
      var from = _d32['default'].time.day.ceil(fromDate),
          to = _d32['default'].time.day.offset(_d32['default'].time.day.ceil(toDate), 1),
          range = _d32['default'].time.day.range(from, to),
          scale = _d32['default'].time.scale().domain([from, to]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      if (selected.size > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = selected.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var entry = _step.value;

            if (!_tag_selection.isSelected(entry[0])) {
              selected['delete'](entry[0]);
            }
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
      if (_tag_selection.selected.size > 0) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _tag_selection.selected[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var tid = _step2.value;

            if (!selected.has(tid)) {
              var topic = _service.topicsMap.get(tid);
              selected.set(tid, topic);
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
      }

      var selectedSeries = [];

      var map = new Map();
      //git s
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _patients.rel_tid.top(Infinity)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var r = _step3.value;

          var entry = map.get(r.tag_id);
          if (!entry) map.set(r.tag_id, entry = []);
          entry.push(_patients.encountersMap.get(r.enc_id));
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
        for (var _iterator4 = map[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var entry = _step4.value;

          var topic = _service.topicsMap.get(entry[0]);
          selectedSeries.push({
            label: topic.name,
            color: topic.color,
            type: 'line',
            marker: 'solid',
            values: histogram(entry[1], range, scale)
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

      var current = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = _patients.currentEncounters.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var eid = _step5.value;

          current.push(_patients.encountersMap.get(eid));
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

      selectedSeries.push({
        label: 'focus',
        color: '#EFEDED',
        type: 'area',
        //right: true,
        marker: 'solid',
        values: histogram(current, range, scale)
      });

      //for(let item of group.all()) {
      //  if (tagSelection.isSelected(item.key)) {
      //    let topic = topicsMap.get(item.key);
      //    let records = item.value.map( v => patients.encountersMap.get(v.enc_id));
      //    selectedSeries.push({
      //      label:  topic.name,
      //      color:  topic.color,
      //      type:   'line',
      //      marker: 'solid',
      //      values: histogram(records, range, scale)
      //    });
      //  }
      //}

      //for(let tag of tagSelection.excluded()) {
      //  selectedSeries.push({
      //      label:  tag.concept.label,
      //      color:  tag.color,
      //      type:   'line',
      //      marker: 'dash',
      //      values:  histogram(tag.items, range, scale)
      //    }
      //  );
      //}

      //selectedSeries.push({
      //  label: tag.concept.label,
      //  color: tag.color,
      //  type: 'line',
      //  values: histogram(selection.selectedItems(), range)
      //});

      //selectedChart.data(selectedSeries);

      //selectedSeries.push(summaryData[0]);
      summaryChart.data(selectedSeries);
    }

    function toArray(iter) {
      var a = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = iter[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var entry = _step6.value;

          a.push(entry);
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

      return a;
    }

    function histogram(items, range, scale) {
      var bins = range.map(function (d) {
        return { x: d, value: 0, items: [] };
      });
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = items[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var item = _step7.value;

          var i = scale(item.date);
          bins[i].value++;
          bins[i].items.push(item);
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

      return bins;
    }

    var info = function info() {};

    info.group = function (_) {
      group = _;
      return this;
    };

    info.resize = function () {
      var name = undefined,
          c = undefined;
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = charts[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _step8$value = _slicedToArray(_step8.value, 2);

          name = _step8$value[0];
          c = _step8$value[1];

          var w = parseInt(_d32['default'].select(name).style('width'));
          var h = parseInt(_d32['default'].select(name).style('height'));
          c.resize([w, h]);
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

      return this;
    };

    return info;
    //{
    //
    //  group(_) {
    //    group = _;
    //    return this;
    //  },
    //
    //  resize() {
    //    let name, c;
    //    for([name, c] of charts) {
    //      let w = parseInt(d3.select(name).style('width'));
    //      let h = parseInt(d3.select(name).style('height'));
    //      c.resize([w, h]);
    //    }
    //    return this;
    //  }
    //}
  };
});

//# sourceMappingURL=info_charts.js.map