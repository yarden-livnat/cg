define(['exports', 'd3', 'lockr', './data'], function (exports, _d3, _lockr, _data) {
  /**
   * Created by yarden on 7/13/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _Lockr = _interopRequireDefault(_lockr);

  var dateFormat = _d32['default'].time.format('%Y-%m-%d');

  function submit() {
    var date = _d32['default'].select('#date').property('value');
    var duration = _d32['default'].select('#duration').property('value');

    _Lockr['default'].set('query.date', date);
    _Lockr['default'].set('query.duration', duration);

    _data.fetchAssociations({
      from: dateFormat(_d32['default'].time.day.offset(_d32['default'].time.week.offset(dateFormat.parse(date), -duration), 1)),
      to: date
    });
  }

  function init() {
    _d32['default'].select('#submit').on('click', submit);

    // default dates
    var date = _Lockr['default'].get('query.date', '2007-12-14');
    var duration = _Lockr['default'].get('query.duration', 1);
    var context = _Lockr['default'].get('query.context', 4);
    _d32['default'].select('#date').property('value', date);
    _d32['default'].select('#duration').property('value', duration);
  }
});

//# sourceMappingURL=query.js.map