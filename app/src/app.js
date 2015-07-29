define(['exports', './components/xpanel', 'formatter', 'd3', 'postal', './services/data', 'query', 'map/map', 'cg/cg', 'info', 'model/models'], function (exports, _componentsXpanel, _formatter, _d3, _postal, _servicesData, _query, _mapMap, _cgCg, _info, _modelModels) {
  /**
   * Created by yarden on 6/30/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CG = _interopRequireDefault(_cgCg);

  var map = (0, _mapMap)('map');
  var selection = _modelModels.selection();
  var cg = (0, _CG['default'])();
  var info = (0, _info)();

  _postal.subscribe({ channel: 'data', topic: 'changed', callback: function callback() {
      selection.domain = _servicesData.domain; //map(function(d) { return d.id;});
    } });

  _postal.subscribe({ channel: 'data', topic: 'ready', callback: function callback() {
      initModules();
    } });

  initHTML();
  _servicesData.init();

  function getSize(el) {
    var d3el = _d3.select(el);
    var w = parseInt(d3el.style('width'));
    var h = parseInt(d3el.style('height'));

    console.log('resize ' + el + ': ' + parseInt(d3el.style('width')) + 'x' + parseInt(d3el.style('height')));

    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }

  function resize() {
    cg.resize(getSize('#cg'));
    info.resize();
  }

  function initHTML() {
    _componentsXpanel.init();

    var duration_input = document.getElementById('duration-input');
    if (duration_input) {
      new _formatter(duration_input, {
        pattern: '{{99}}'
      });
    }

    window.addEventListener('resize', resize);
  }

  function initModules() {
    _query.init();

    map.population(_servicesData.population).selection(selection).init();

    cg.init('#cg').selection(selection);

    info.init().selection(selection);

    resize();
  }
});

//# sourceMappingURL=app.js.map