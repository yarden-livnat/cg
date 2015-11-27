define(['exports', 'd3', 'postal', 'lockr', '../config', '../service', '../components/chart3'], function (exports, _d3, _postal, _lockr, _config, _service, _componentsChart3) {
  /**
   * Created by yarden on 11/19/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _Lockr = _interopRequireDefault(_lockr);

  var _chart3 = _interopRequireDefault(_componentsChart3);

  var dateFormat = _d32['default'].time.format('%Y-%m-%d');

  var pathogensTimeFormat = _d32['default'].time.format.multi([['%b %d', function (d) {
    return d.getDate() != 1;
  }], ['%B', function (d) {
    return d.getMonth();
  }]]);

  var pathogens_scale = _d32['default'].time.scale().nice(_d32['default'].time.week, 1);
  pathogens_scale.tickFormat(_d32['default'].format('%b %d'));
  pathogens_scale.ticks(_d32['default'].time.week, 1);

  var initialized = false;
  var activePathogens = new Map();

  var from = undefined,
      to = undefined,
      range = undefined,
      from_week = undefined,
      from_year = undefined;

  _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: dataChanged });

  function init() {

    var items = _d32['default'].select('#pathogens-selection').select('ul').selectAll('li').data(_service.pathogens).enter().append('li');

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

  function dataChanged(params) {
    to = dateFormat.parse(params.to); //d3.time.week.ceil(params.to);
    from = _d32['default'].time.week(_d32['default'].time.day.offset(_d32['default'].time.month.offset(to, -_config.pathogens_duration), 1));
    range = _d32['default'].time.week.range(from, to);

    from_week = _d32['default'].time.weekOfYear(from);
    from_year = from.getFullYear();

    if (!initialized) {
      var _iteratorNormalCompletion;

      var _didIteratorError;

      var _iteratorError;

      var _iterator, _step;

      (function () {
        initialized = true;
        var list = _Lockr['default'].get('pathogens', []);
        _d32['default'].select('#pathogens-selection').selectAll('input').property('checked', function (d) {
          return list.indexOf(d.name) != -1;
        });

        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;

        try {
          for (_iterator = list[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var p = _step.value;

            selectPathogen(p, true);
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
      })();
    } else {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = activePathogens.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
  }

  function updatePathogens(names) {
    _service.fetch('pathogens', [names], from, /*params.*/to).then(function (d) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = d[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var entry = _step3.value;

          var positive = range.map(function (d) {
            return { x: d, value: 0, items: [] };
          });
          //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = entry.rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var item = _step4.value;

              if (item.positive) {
                item.date = dateFormat.parse(item.date);
                var i = _d32['default'].time.weekOfYear(item.date) + (item.date.getFullYear() - from_year) * 52 - from_week;
                //let bins = item.positive ? positive : negative;
                positive[i].value++;
                positive[i].items.push(item);
              }
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

          var series = [{
            label: 'positive',
            color: 'red',
            type: 'line',
            marker: 'solid',
            //interpolate: 'step-after',
            interpolate: 'basis',
            values: positive
            //}
            //{
            //  label: 'negative',
            //  color: 'green',
            //  type: 'line',
            //  marker: 'solid',
            //  values: negative
          }];
          activePathogens.get(entry.name).data(series);
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
    })['catch'](function (reason) {
      console.error('error: ', reason);
    });
  }

  function selectPathogen(name, show) {
    if (show) {
      var div = _d32['default'].select('#pathogens').append('div').attr('id', 'chart-' + name).classed('pathogen', true);
      var x = _d32['default'].time.scale().nice(_d32['default'].time.week, 1);
      x.tickFormat(_d32['default'].time.format('%m %d'));
      x.ticks(_d32['default'].time.week, 1);
      var c = (0, _chart3['default'])(div).title(name).xscale(x);

      activePathogens.set(name, c);
      updatePathogens(name);
    } else {
      _d32['default'].select('#pathogens').select('#chart-' + name).remove();
      activePathogens['delete'](name);
    }

    _Lockr['default'].set('pathogens', Array.from(activePathogens.keys()));
  }
});

//# sourceMappingURL=info_pathogens.js.map