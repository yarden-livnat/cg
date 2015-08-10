define(['exports', 'module', 'd3', 'postal', '../data', '../components/table', '../components/bar'], function (exports, module, _d3, _postal, _data, _componentsTable, _componentsBar) {
  /**
   * Created by yarden on 7/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _table = _interopRequireDefault(_componentsTable);

  var _bar = _interopRequireDefault(_componentsBar);

  module.exports = function (opt) {
    var _selection = undefined;
    var bars = (0, _bar['default'])();
    var post = _postal2['default'].channel('events');

    var tagsTable = (0, _table['default'])('#details-tables', 'tags-table').header([{ name: 'name', title: 'Concept', cellAttr: function cellAttr(r) {
        return r.attr && r.attr.name;
      } },
    //{name: 'category', title: 'Cat'},
    //{name: 'system', title: 'Sys'},
    //{name: 'act', attr: 'numeric'},
    //{name: 'num', title: 'N', attr: 'numeric'},
    { name: 'encounters', render: bars }]).on('mouseover', function (d) {
      post.publish('tag.highlight', { name: d.value, show: true });
    }).on('mouseout', function (d) {
      post.publish('tag.highlight', { name: d.value, show: false });
    }).on('click', function (d) {
      if (_d32['default'].event.shiftKey) {
        _selection.exclude(d.row.tag);
      } else {
        _selection.select(d.row.tag);
      }
    });

    var catTable = (0, _table['default'])('#details-tables', 'cat-table').header([{ name: 'category' }, { name: 'encounters' }]);

    var sysTable = (0, _table['default'])('#details-tables', 'sys-table').header([{ name: 'system' }, { name: 'encounters' }]);

    function _init() {
      _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });
    }

    function dataChanged() {
      var entry = undefined;

      bars.max(_d32['default'].max(_data.tags, function (d) {
        return d.items.length;
      }));
      tagsTable.data(_data.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          //category: tag.concept.category,
          //system: tag.concept.system,
          //act:  tag.items.length,
          //num: tag.items.length,
          //num: tag.items.length,
          encounters: tag.items.length,
          tag: tag,
          attr: {}
        };
      }));

      // categories
      var cat = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _data.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tag = _step.value;

          var n = cat.get(tag.concept.category) || 0;
          cat.set(tag.concept.category, n + 1);
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

      var categories = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = cat.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          entry = _step2.value;

          categories.push({ category: entry[0], encounters: entry[1] });
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

      catTable.data(categories);

      //systems
      var sys = new Map();
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _data.tags[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var tag = _step3.value;

          var n = sys.get(tag.concept.system) || 0;
          sys.set(tag.concept.system, n + 1);
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

      var systems = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = sys.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          entry = _step4.value;

          systems.push({ system: entry[0], encounters: entry[1] });
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      sysTable.data(systems);

      selectionChanged();
    }

    function selectionChanged() {
      updateSelectionList();

      var tag = undefined,
          attr = new Map();

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = _selection.tags()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          tag = _step5.value;
          attr.set(tag.concept.label, 'selected');
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = _selection.excluded()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          tag = _step6.value;
          attr.set(tag.concept.label, 'excluded');
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      var rows = tagsTable.data();
      if (rows) {
        var max = 0;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = rows[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var row = _step7.value;

            row.attr.name = attr.get(row.name);
            //if (attr.get(row.tag.concept.label) != 'excluded') {
            row.encounters = _selection.countActive(row.tag.items);
            max = Math.max(max, row.encounters);
            //} else {
            //  row.encounters = row.tag.items.length;
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7['return']) {
              _iterator7['return']();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        bars.max(max);
        tagsTable.data(rows);
      }

      var entry = undefined;
      var categories = new Map();
      var systems = new Map();
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = _data.tags[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          tag = _step8.value;

          if (_selection.countActive(tag.items) > 0) {
            var c = categories.get(tag.concept.category) || 0;
            categories.set(tag.concept.category, c + 1);
            var s = systems.get(tag.concept.system) || 0;
            systems.set(tag.concept.system, s + 1);
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8['return']) {
            _iterator8['return']();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      var cat = [];
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = categories.entries()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          entry = _step9.value;

          cat.push({ category: entry[0], encounters: entry[1] });
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9['return']) {
            _iterator9['return']();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      catTable.data(cat);

      var sys = [];
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = systems.entries()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          entry = _step10.value;

          sys.push({ system: entry[0], encounters: entry[1] });
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10['return']) {
            _iterator10['return']();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      sysTable.data(sys);
    }

    function updateSelectionList() {
      var tag = undefined,
          list = [];
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = _selection.tags()[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          tag = _step11.value;

          list.push({ name: tag.concept.label, attr: 'selected' });
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11['return']) {
            _iterator11['return']();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = _selection.excluded()[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          tag = _step12.value;

          list.push({ name: tag.concept.label, attr: 'excluded' });
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12['return']) {
            _iterator12['return']();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      var s = _d32['default'].select('#selection-list').selectAll('li').data(list);

      s.enter().append('li');
      s.text(function (d) {
        return d.name;
      }).attr('class', function (d) {
        return d.attr;
      });
      s.exit().remove();
    }

    return {
      init: function init() {
        _init();
        return this;
      },

      selection: function selection(s) {
        _selection = s;
        _selection.on('changed.info.tables', selectionChanged);
        return this;
      },

      resize: function resize() {
        return this;
      }
    };
  };
});

//# sourceMappingURL=info-tables.js.map