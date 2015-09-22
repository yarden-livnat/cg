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

  var _postal2 = _interopRequireDefault(_postal);

  var _table = _interopRequireDefault(_componentsTable);

  var _bar = _interopRequireDefault(_componentsBar);

  var container = _d32['default'].select('#details-tables');

  var cat = Table(container).id('cat-table').header([{ name: 'key', title: 'Category' }, { name: 'value', title: '#tags', attr: 'numeric' }]).dimension(_patients.topics_cat);

  var sys = Table(container).id('sys-table').header([{ name: 'key', title: 'System' }, { name: 'value', title: '#tags', attr: 'numeric' }]).dimension(_patients.topics_sys);

  var bars = (0, _bar['default'])();
  var tags = RelTable(container).id('tags-table').header([{ name: 'topic', title: 'Topic', cellAttr: function cellAttr(r) {
      return r.attr && r.attr.name;
    } }, { name: 'value', title: 'Encounters', render: bars }]).in_dimension(_patients.rel_tid).out_dimension(_patients.enc_tags);
  //.on('mouseover', function(d) { post.publish('tag.highlight', {name: d.value, show: true}); })
  //.on('mouseout', function(d) { post.publish('tag.highlight', {name: d.value, show: false}); })

  _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: render });

  function init() {}

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
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
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
    var in_dimension = undefined;
    var out_dimension = undefined;
    var dirty = false;
    var inner = (0, _table['default'])(div).on('click', function click(d) {
      dirty = true;
      var key = d.row.key;
      if (_d32['default'].event.metaKey) {
        if (!excluded['delete'](key)) excluded.add(key);
        selected['delete'](key);
      } else {
        if (!selected['delete'](key)) selected.add(key);
        excluded['delete'](key);
      }

      _d32['default'].select(this).classed('selected', selected.has(key)).classed('excluded', excluded.has(key));

      if (selected.size == 0 && excluded.size == 0) out_dimension.filterAll();else {
        out_dimension.filter(filter);
      }
      _patients.update(out_dimension);

      // todo: should this be done in patients.update?
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
    });

    function filter(eid) {
      var enc = _patients.encountersMap.get(eid);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = selected[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var s = _step.value;
          if (!enc.tags.has(s)) return false;
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = excluded[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var e = _step2.value;
          if (enc.tags.has(e)) return false;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    }

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

    api.in_dimension = function (_) {
      in_dimension = _;
      return this;
    };

    api.out_dimension = function (_) {
      out_dimension = _;
      return this;
    };

    api.render = function () {
      if (dirty) {
        dirty = false;
      } else {
        var items = in_dimension.group().top(Infinity);
        var max = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            item.topic = _service.topicsMap.get(item.key).label;
            max = Math.max(max, item.value);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
              _iterator3['return']();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        bars.max(max);
        inner.data(items);
      }
      return this;
    };

    return api;
  }
});

//for (let topic of topics) topicsMap.set(topic.id, topic.label);

//# sourceMappingURL=info_tables.js.map