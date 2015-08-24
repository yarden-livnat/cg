define(['exports', 'd3', 'lockr'], function (exports, _d3, _lockr) {
  /**
   * Created by yarden on 8/21/15.
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
  var report = function report() {};

  function startSpinner() {
    _d32['default'].select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'visible');
  }

  function stopSpinner() {
    _d32['default'].select('#submit-spinner').classed('fa-pulse', true).style('visibility', 'none');
  }

  function submit() {
    var to = _d32['default'].select('#date').property('value');
    var duration = _d32['default'].select('#duration').property('value');

    _Lockr['default'].set('query.date', to);
    _Lockr['default'].set('query.duration', duration);

    var from = dateFormat(_d32['default'].time.day.offset(_d32['default'].time.week.offset(dateFormat.parse(to), -duration), 1));

    var url = '/query?from=' + from + '&to=' + to;

    startSpinner();
    _d32['default'].json(url, function (err, data) {
      stopSpinner();
      report(err, data);
    });
  }

  function init(cb) {
    report = cb;
    _d32['default'].select('#submit').on('click', submit);

    // default dates
    var date = _Lockr['default'].get('query.date', '2007-12-14');
    var duration = _Lockr['default'].get('query.duration', 1);
    var context = _Lockr['default'].get('query.context', 4);

    _d32['default'].select('#date').property('value', date);
    _d32['default'].select('#duration').property('value', duration);

    submit();
  }
});

//# sourceMappingURL=query.js.map