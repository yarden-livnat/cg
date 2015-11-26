define(['exports', 'd3', 'postal', '../config', '../service', '../components/chart3'], function (exports, _d3, _postal, _config, _service, _componentsChart3) {
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

  var activePathogens = new Map();

  var from = undefined,
      to = undefined,
      range = undefined,
      from_week = undefined,
      from_year = undefined;

  _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: dataChanged });

  function init() {
    /* pathogens */
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

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = activePathogens.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _name = _step.value;

        updatePathogens(_name);
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

  function updatePathogens(names) {
    _service.fetch('pathogens', [names], from, /*params.*/to).then(function (d) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = d[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var entry = _step2.value;

          var positive = range.map(function (d) {
            return { x: d, value: 0, items: [] };
          });
          //let negative = range.map(function (d) { return {x: d, value: 0, items: []}; });

          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = entry.rows[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var item = _step3.value;

              if (item.positive) {
                item.date = dateFormat.parse(item.date);
                var i = _d32['default'].time.weekOfYear(item.date) + (item.date.getFullYear() - from_year) * 52 - from_week;
                //let bins = item.positive ? positive : negative;
                positive[i].value++;
                positive[i].items.push(item);
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
          activePathogens.get(entry.name).data(series);
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
    })['catch'](function (reason) {
      console.error('error: ', reason);
    });
  }

  function selectPathogen(name, show) {
    if (show) {
      var div = _d32['default'].select('#pathogens').append('div').attr('id', 'chart-' + name);
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
  }
});

//# sourceMappingURL=info_pathogens.js.map