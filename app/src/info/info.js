define(['exports', 'module', './info-tables', './info-charts', './info-detectors'], function (exports, module, _infoTables, _infoCharts, _infoDetectors) {
  /**
   * Created by yarden on 8/6/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Detectors = _interopRequireDefault(_infoDetectors);

  module.exports = function () {

    var tables = (0, _infoTables)();
    var charts = (0, _infoCharts)();
    var detectors = (0, _Detectors['default'])();

    return {
      init: function init() {
        tables.init();
        charts.init();
        detectors.init();
        return this;
      },

      selection: function selection(s) {
        tables.selection(s);
        charts.selection(s);
        detectors.selection(s);
        return this;
      },

      resize: function resize() {
        tables.resize();
        charts.resize();
      }
    };
  };
});

//# sourceMappingURL=info.js.map