define(['exports', 'queue', 'postal', './service', './query', './patients', './info_tables', './map'], function (exports, _queue, _postal, _service, _query, _patients, _info_tables, _map) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _queue2 = _interopRequireDefault(_queue);

  var _postal2 = _interopRequireDefault(_postal);

  var _Map = _interopRequireDefault(_map);

  var geomap = (0, _Map['default'])();
  var dateFormat = d3.time.format('%Y-%m-%d');

  (0, _queue2['default'])().defer(function (cb) {
    _service.init(cb);
  }).defer(function (cb) {
    geomap.init(cb);
  }).awaitAll(function (err) {
    if (err) error(err);else {
      _patients.init(_service.topics);
      _query.init(updateData);
      _info_tables.init();
    }
  });

  function updateData(err, data) {
    if (err) error(err);else {
      // clean up the data
      data.enc.forEach(function (d) {
        d.date = d3.time.day.round(dateFormat.parse(d.date));
      });

      _patients.set({
        from: data.from,
        to: data.to,
        encounters: data.enc,
        relations: data.associations
      });

      // todo: reset filters
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
    }
  }

  function error(err) {
    console.error(err);
  }
  window.addEventListener('resize', function () {
    console.log('window resize');
  });
});

//# sourceMappingURL=app.js.map