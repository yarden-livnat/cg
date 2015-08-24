define(['exports', 'd3', 'postal', './patients', './service', './components/table', './components/bar'], function (exports, _d3, _postal, _patients, _service, _componentsTable, _componentsBar) {
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

  var _bar = _interopRequireDefault(_componentsBar);

  var container = _d32['default'].select('#details-tables');
  var topicsMap = new Map();

  var cat = Table(container).id('cat-table').header([{ name: 'key', title: 'Category' }, { name: 'value', title: '#tags', attr: 'numeric' }]).dimension(_patients.topics_cat);

  var sys = Table(container).id('sys-table').header([{ name: 'key', title: 'System' }, { name: 'value', title: '#tags', attr: 'numeric' }]).dimension(_patients.topics_sys);

  var bars = (0, _bar['default'])();
  var tags = RelTable(container).id('tags-table').header([{ name: 'topic', title: 'Topic', cellAttr: function cellAttr(r) {
      return r.attr && r.attr.name;
    } }, { name: 'value', title: 'Encounters', render: bars }]).dimension(_patients.rel_tid);
  //.on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
  //.on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); })
  //.on('click', function(d) {
  //  if (d3.event.shiftKey) selection.exclude(d.row.tag);
  //  else selection.select(d.row.tag);
  //});

  _postal.subscribe({ channel: 'global', topic: 'render', callback: render });

  function init() {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = _service.topics[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var topic = _step.value;
        topicsMap.set(topic.id, topic.label);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function reset() {}

  function render() {
    cat.render();
    sys.render();
    tags.render();
  }

  function Table(div) {
    var selected = new Set();
    var excluded = new Set();
    var dimension = undefined;
    var dirty = false;
    var inner = (0, _table['default'])(div).on('click', function click(d) {
      dirty = true;
      if (selected['delete'](d.value)) {
        _d32['default'].select(this).classed('selected', false);
      } else {
        _d32['default'].select(this).classed('selected', true);
        selected.add(d.value);
      }
      if (selected.size == 0) dimension.filterAll();else dimension.filter(function (v) {
        return selected.has(v);
      });
      _patients.update(dimension);

      // todo: should this be done in patients.update?
      _postal.publish({ channel: 'global', topic: 'render' });
    });

    function api(selection) {
      return this;
    }

    api.id = function (_) {
      inner.id(_);
      return this;
    };

    api.header = function (_) {
      inner.header(_);
      return this;
    };

    api.dimension = function (_) {
      dimension = _;
      return this;
    };

    api.render = function () {
      if (dirty) {
        dirty = false;
      } else {
        inner.data(dimension.group().top(Infinity));
      }
      return this;
    };

    return api;
  }

  function RelTable(div) {
    var selected = new Set();
    var excluded = new Set();
    var dimension = undefined;
    var dirty = false;
    var inner = (0, _table['default'])(div).on('click', function click(d) {
      dirty = true;
      var key = d.row.key;
      if (_d32['default'].event.ctrlKey) {
        if (!excluded['delete'](key)) excluded.add(key);
        selected['delete'](key);
      } else {
        if (!selected['delete'](key)) selected.add(key);
        excluded['delete'](key);
      }

      _d32['default'].select(this).classed('selected', selected.has(key)).classed('excluded', excluded.has(key));

      if (selected.size == 0 && excluded.size == 0) dimension.filterAll();else dimension.filter(function (v) {
        return selected.has(v);
      });
      _patients.update(dimension);

      // todo: should this be done in patients.update?
      _postal.publish({ channel: 'global', topic: 'render' });
    });

    function api(selection) {
      return this;
    }

    api.id = function (_) {
      inner.id(_);
      return this;
    };

    api.header = function (_) {
      inner.header(_);
      return this;
    };

    api.dimension = function (_) {
      dimension = _;
      return this;
    };

    api.render = function () {
      if (dirty) {
        dirty = false;
      } else {
        var items = dimension.group().top(Infinity);
        items.forEach(function (item) {
          return item.topic = topicsMap.get(item.key);
        });
        inner.data(items);
      }
      return this;
    };

    return api;
  }
});

//# sourceMappingURL=info_tables.js.map