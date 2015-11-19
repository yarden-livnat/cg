define(['exports', 'queue', 'postal', './service', './query', './patients', './info/info_tables', './info/info_charts', './info/info_detectors', './info/info_selection', './info/info_pathogens', './cg/cg', './map'], function (exports, _queue, _postal, _service, _query, _patients, _infoInfo_tables, _infoInfo_charts, _infoInfo_detectors, _infoInfo_selection, _infoInfo_pathogens, _cgCg, _map) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _queue2 = _interopRequireDefault(_queue);

  var _postal2 = _interopRequireDefault(_postal);

  var _Detectors = _interopRequireDefault(_infoInfo_detectors);

  var _infoSelection = _interopRequireDefault(_infoInfo_selection);

  var _CG = _interopRequireDefault(_cgCg);

  var _Map = _interopRequireDefault(_map);

  var geomap = (0, _Map['default'])();
  var cg = (0, _CG['default'])().group(_patients.tag_enc_group);
  var detectors = (0, _Detectors['default'])();
  var infoChart = (0, _infoInfo_charts)().group(_patients.tag_enc_group);

  var dateFormat = d3.time.format('%Y-%m-%d');

  (0, _queue2['default'])().defer(function (cb) {
    _service.init(cb);
  }).defer(function (cb) {
    geomap.init(cb);
  }).awaitAll(function (err) {
    if (err) error(err);else {
      _patients.init(_service.topics);
      _infoInfo_tables.init();
      _infoInfo_pathogens.init();
      detectors.init(_service.detectors.map(_patients.addDetector));
      cg(d3.select('#cg-area')).resize(getSize('#cg-area'));
      _query.init(updateData);
    }
  });

  function updateData(err, data) {
    if (err) error(err);else {
      // clean the data
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
      _postal2['default'].publish({ channel: 'global', topic: 'data.changed', data: { from: data.from, to: data.to } });
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
    cg.resize(getSize('#cg-area'));
  });
});

//# sourceMappingURL=app.js.map