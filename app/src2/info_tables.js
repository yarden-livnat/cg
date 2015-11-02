define(['exports', 'd3', 'postal', './patients', './service', './tag_selection', './components/table', './components/bar'], function (exports, _d3, _postal, _patients, _service, _tag_selection, _componentsTable, _componentsBar) {
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
    } }, { name: 'value', title: 'Encounters', render: bars }]).in_dimension(_patients.rel_tid);
  //.out_dimension(patients.enc_tags);
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
    var group = undefined;

    var inner = (0, _table['default'])(div).on('click', function click(d) {
      if (_d32['default'].event.metaKey) {
        if (!excluded['delete'](d.value)) excluded.add(d.value);
        selected['delete'](d.value);
      } else {
        if (!selected['delete'](d.value)) selected.add(d.value);
        excluded['delete'](d.value);
      }

      d.row.classes = { selected: selected.has(d.value), excluded: excluded.has(d.value) };

      if (selected.size == 0 && excluded.size == 0) dimension.filterAll();else dimension.filter(function (v) {
        return (selected.size == 0 || selected.has(v)) && (excluded.size == 0 || !excluded.has(v));
      });

      _patients.update(dimension);
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
      if (group) group.dispose();
      group = dimension.group();
      return this;
    };

    api.render = function () {
      inner.data(group.all());
      return this;
    };

    return api;
  }

  function RelTable(div) {
    var in_dimension = undefined;
    var in_group = undefined;
    var out_dimension = undefined;
    var dirty = false;
    var inner = (0, _table['default'])(div).on('click', function click(d) {
      dirty = true;
      var key = d.row.key;

      if (_d32['default'].event.metaKey) _tag_selection.exclude(key);else _tag_selection.select(key);
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

    api.in_dimension = function (_) {
      in_dimension = _;
      if (in_group) in_group.dispose();
      in_group = in_dimension.group();
      return this;
    };

    api.out_dimension = function (_) {
      out_dimension = _;
      return this;
    };

    api.render = function () {
      var items = in_group.all();
      var max = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item.topic = _service.topicsMap.get(item.key).label;
          item.classes = {
            'selected': _tag_selection.isSelected(item.key),
            'excluded': _tag_selection.isExcluded(item.key)
          };
          max = Math.max(max, item.value);
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

      bars.max(max);
      inner.data(items);
      return this;
    };

    return api;
  }
});

//for (let topic of topics) topicsMap.set(topic.id, topic.label);

//# sourceMappingURL=info_tables.js.map