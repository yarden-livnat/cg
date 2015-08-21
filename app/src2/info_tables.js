define(['exports', 'd3', 'postal', './patients', './components/table'], function (exports, _d3, _postal, _patients, _componentsTable) {
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

  var _table = _interopRequireDefault(_componentsTable);

  var update = function update() {}; // no-op

  var catTable = (0, _table['default'])('#details-tables', 'cat-table').header([{ name: 'key', title: 'Category' }, { name: 'value', title: '#tags', attr: 'numeric' }]).on('click', function (d) {
    _patients.topics_cat.filter(d.value);
    _patients.update(_patients.topics_cat);
    _postal.publish({ channel: 'global', topic: 'render' });
  });

  var sysTable = (0, _table['default'])('#details-tables', 'sys-table').header([{ name: 'key', title: 'System' }, { name: 'value', title: '#tags', attr: 'numeric' }]).on('click', function (d) {
    _patients.topics_sys.filter(d.value);
    _patients.update(_patients.topics_sys);
    _postal.publish({ channel: 'global', topic: 'render' });
  });

  _postal.subscribe({ channel: 'global', topic: 'render', callback: render });

  function init() {}

  function reset() {}

  function render() {
    catTable.data(_patients.topics_cat.group().top(Infinity));
    sysTable.data(_patients.topics_sys.group().top(Infinity));
  }
});

//# sourceMappingURL=info_tables.js.map