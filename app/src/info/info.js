define(['exports', 'module', './info-tables', './info-charts'], function (exports, module, _infoTables, _infoCharts) {
  /**
   * Created by yarden on 8/6/15.
   */

  'use strict';

  module.exports = function () {

    var tables = (0, _infoTables)();
    var charts = (0, _infoCharts)();

    return {
      init: function init() {
        tables.init();
        charts.init();
        return this;
      },

      selection: function selection(s) {
        tables.selection(s);
        charts.selection(s);
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