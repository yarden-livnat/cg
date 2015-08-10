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
    //let bullets = bullet();
    var bars = (0, _bar['default'])();

    var tagsTable = (0, _table['default'])('#details-tables', 'tags-table').header([{ name: 'name', title: 'Concept', cellAttr: function cellAttr(r) {
        return r.attr && r.attr.name;
      } },
    //{name: 'category', title: 'Cat'},
    //{name: 'system', title: 'Sys'},
    //{name: 'act', attr: 'numeric'},
    //{name: 'num', title: 'N', attr: 'numeric'},
    { name: 'encounters', render: bars }]);

    function _init() {
      _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });
    }

    function dataChanged() {
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
          encounters: tag.items.length,
          tag: tag,
          attr: {}
        };
      }));
    }

    function selectionChanged() {
      var tag = undefined,
          attr = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _selection.tags()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          tag = _step.value;
          attr.set(tag.concept.label, 'selected');
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
        for (var _iterator2 = _selection.excluded()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          tag = _step2.value;
          attr.set(tag.concept.label, 'excluded');
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

      var rows = tagsTable.data();
      if (rows) {
        var max = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = rows[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var row = _step3.value;

            row.attr.name = attr.get(row.name);
            row.encounters = _selection.countActive(row.tag.items);
            max = Math.max(max, row.encounters);
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
        tagsTable.data(rows);
      }

      //mark(selection.tags(), {selected: true, excluded: false});
      //mark(selection.excluded(), {selected: false, excluded: true});
    }

    function updateSelectionList() {
      var tag = undefined,
          list = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _selection.tags()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          tag = _step4.value;

          list.push({ name: tag.concept.label, attr: 'selected' });
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

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = _selection.excluded()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          tag = _step5.value;

          list.push({ name: tag.concept.label, attr: 'excluded' });
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

      var s = _d32['default'].select('#selection-list').selectAll('li').data(list);

      s.enter().append('li');
      s.text(function (d) {
        return d.name;
      }).attr('class', function (d) {
        return d.attr;
      });
      s.exit().remove();
    }

    function mark(list, markers) {
      var s = new Set();
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var tag = _step6.value;
          s.add(tag.concept.label);
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

      tagsTable.row(function (d) {
        return s.has(d.name);
      }).selectAll(':first-child').classed(markers);
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