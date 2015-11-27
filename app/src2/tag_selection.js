define(['exports', 'postal', './patients', './utils', './service'], function (exports, _postal, _patients, _utils, _service) {
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

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _postal2 = _interopRequireDefault(_postal);

  var dimension = _patients.rel_tid;
  var selected = new Set();
  exports.selected = selected;
  var excluded = new Set();

  exports.excluded = excluded;
  function accept(enc) {
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

  function activeEncounters() {
    var active = new Set();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = _patients.encountersMap.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var enc = _step3.value;

        if (accept(enc)) active.add(enc.id);
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

    return active;
  }

  function update() {
    if (isEmpty()) dimension.filterAll();else {
      (function () {
        var e = activeEncounters();
        dimension.filter(function (entry) {
          return e.has(entry.eid);
        });
      })();
    }

    _patients.update(dimension);
    _postal2['default'].publish({ channel: 'global', topic: 'render' });
  }

  function select(item) {
    if (!selected['delete'](item)) {
      selected.add(item);
      _utils.assign_color(_service.topicsMap.get(item));
    } else {
      _utils.release_color(_service.topicsMap.get(item));
    }
    excluded['delete'](item);
    update();
  }

  function exclude(item) {
    if (!excluded['delete'](item)) {
      excluded.add(item);
      _utils.assign_color(_service.topicsMap.get(item));
    } else {
      _utils.release_color(_service.topicsMap.get(item));
    }
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
});

//# sourceMappingURL=tag_selection.js.map