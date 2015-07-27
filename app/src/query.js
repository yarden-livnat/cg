define(['exports', 'd3', 'services/data'], function (exports, _d3, _servicesData) {
  /**
   * Created by yarden on 7/13/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;

  var dateFormat = _d3.time.format('%Y-%m-%d');

  function submit() {
    var date = _d3.select('#date').property('value');
    var duration = _d3.select('#duration').property('value');

    _servicesData.fetchAssociations({
      from: dateFormat(_d3.time.week.offset(dateFormat.parse(date), -duration)),
      to: date
    });
  }

  function init() {
    _d3.select('#submit').on('click', submit);

    // default dates
    _d3.select('#date').property('value', '2007-12-14');
    _d3.select('#duration').property('value', '4');
  }
});

//# sourceMappingURL=query.js.map