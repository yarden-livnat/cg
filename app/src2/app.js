define(['exports', 'queue', 'postal', './service', './query', './patients', './info_tables', './cg/cg', './map'], function (exports, _queue, _postal, _service, _query, _patients, _info_tables, _cgCg, _map) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _queue2 = _interopRequireDefault(_queue);

  var _postal2 = _interopRequireDefault(_postal);

  var _CG = _interopRequireDefault(_cgCg);

  var _Map = _interopRequireDefault(_map);

  var geomap = (0, _Map['default'])();
  var cg = (0, _CG['default'])().dimension(_patients.rel_tid);

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
      cg(d3.select('#cg'));
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

      // todo: reapply filters
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
    }
  }

  function error(err) {
    console.error(err);
  }

  function getSize(el) {
    var d3el = d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }

  window.addEventListener('resize', function () {
    console.log('window resize');
    cg.resize(getSize('#cg'));
  });
});

//# sourceMappingURL=app.js.map