define(['exports', './components/xpanel', 'formatter', 'map/Map', 'model/kb'], function (exports, _componentsXpanel, _formatter, _mapMap, _modelKb) {
  /**
   * Created by yarden on 6/30/15.
   */

  'use strict';

  console.log('in app');

  var map = (0, _mapMap)('map');

  initHTML();
  initModules();

  function initHTML() {
    _componentsXpanel.init();

    var duration_input = document.getElementById('duration-input');
    if (duration_input) {
      new _formatter(duration_input, {
        pattern: '{{99}}'
      });
    }
  }

  function initModules() {
    _modelKb.init();
  }
});

//# sourceMappingURL=app.js.map