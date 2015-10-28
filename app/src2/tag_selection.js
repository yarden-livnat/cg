define(['exports', './patients', 'postal'], function (exports, _patients, _postal) {
  /**
   * Created by yarden on 10/27/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.select = select;
  exports.exclude = exclude;
  exports.isEmpty = isEmpty;
  exports.isSelected = isSelected;
  exports.isExcluded = isExcluded;
  exports.filter = filter;

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _postal2 = _interopRequireDefault(_postal);

  var dimension = _patients.enc_tags;
  var selected = new Set();
  var excluded = new Set();

  function update() {
    if (isEmpty()) dimension.filterAll();else dimension.filter(filter);
    _patients.update(dimension);
    _postal2['default'].publish({ channel: 'global', topic: 'render' });
  }

  function select(item) {
    if (!selected['delete'](item)) selected.add(item);
    excluded['delete'](item);
    update();
  }

  function exclude(item) {
    if (!excluded['delete'](item)) excluded.add(item);
    selected['delete'](item);
    update();
  }

  function isEmpty() {
    return selected.size == 0 && excluded.size == 0;
  }

  function isSelected(item) {
    return selected.has(item);
  }

  function isExcluded(item) {
    return excluded.has(item);
  }

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
});

//# sourceMappingURL=tag_selection.js.map