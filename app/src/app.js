define(['exports', './components/xpanel', 'd3', 'postal', './data', './query', './map', './cg/cg', './info/info', './model/models'], function (exports, _componentsXpanel, _d3, _postal, _data, _query, _map, _cgCg, _infoInfo, _modelModels) {
  /**
   * Created by yarden on 6/30/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _CG = _interopRequireDefault(_cgCg);

  var map = (0, _map)();
  var selection = _modelModels.selection();
  var cg = (0, _CG['default'])();
  var info = (0, _infoInfo)();

  var preSelection = undefined;

  _postal.subscribe({ channel: 'data', topic: 'pre-changed', callback: function callback() {
      selection.reset(_data.domain, _data.tags);
    } });

  //postal.subscribe({channel:'data', topic:'changed', callback: () => { selection.domain = data.domain; }});
  _postal.subscribe({ channel: 'data', topic: 'post-changed', callback: function callback() {
      selection.update();
    } });

  _postal.subscribe({ channel: 'data', topic: 'ready', callback: function callback() {
      initModules();
    } });

  initHTML();
  _data.init();

  function getSize(el) {
    var d3el = _d3.select(el);
    return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
  }

  function resize() {
    cg.resize(getSize('#cg'));
    info.resize();
  }

  function initHTML() {
    _componentsXpanel.init();

    //let duration_input = document.getElementById('duration-input');
    //if (duration_input) {
    //  new Formater(duration_input, {
    //    pattern: "{{99}}"
    //  });
    //}

    window.addEventListener('resize', resize);
  }

  function initModules() {
    _query.init();

    map.population(_data.population).selection(selection).init();

    cg.init('#cg').selection(selection);

    info.init().selection(selection);

    resize();
  }
});

//import * as Formater from 'formatter.js'

//# sourceMappingURL=app.js.map