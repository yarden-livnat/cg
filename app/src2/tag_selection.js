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

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _postal2 = _interopRequireDefault(_postal);

  var dimension = _patients.rel_tid; //enc_tags;
  var selected = new Set();
  var excluded = new Set();

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

    //console.log('enc:', enc.id,'tags:', enc.tags)
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

  function activeTags() {
    var tags = new Set();

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = _patients.encountersMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var e = _step4.value;

        if (accept(e)) {
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = e.tags[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _t = _step5.value;

              tags.add(_t);
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
        }
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

    return tags;
  }

  var count = 0;
  function filter(activeSet) {
    return function (tid) {
      if (activeSet.has(tid)) {
        console.log('filter: ', tid);count++;
      }
      return activeSet.has(tid);
    };
  }

  function update() {
    if (isEmpty()) dimension.filterAll();else {
      (function () {
        var e = activeEncounters();
        console.log('active:', e.size);
        dimension.filter(function (entry) {
          return e.has(entry.eid);
        });
      })();
    }
    //dimension.filter(filter(activeTags()));

    _patients.update(dimension);
    _postal2['default'].publish({ channel: 'global', topic: 'render' });
  }

  function select(item) {
    console.log('select:', item);
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

  //export function filter(tid) {
  //  return (selected.size == 0 || selected.has(tid)) && (excluded.size == 0 || !excluded.has(tid));
  //}
  //
  //export function filter1(eid) {
  //  let enc = patients.encountersMap.get(eid);
  //  for (let s of selected) if (!enc.tags.has(s)) return false;
  //  for (let e of excluded) if (enc.tags.has(e)) return false;
  //  return true;
  //}
});

//# sourceMappingURL=tag_selection.js.map