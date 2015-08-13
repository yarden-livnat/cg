define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 7/12/15.
   */

  'use strict';

  var available_colors = _d3.scale.category10().range();
  var default_color = 'gray';

  function assign_color(tag) {
    if (!tag.color) {
      tag.color = available_colors.shift() || default_color;
    } else {
      var i = available_colors.indexOf(tag.color);
      if (i == -1) {
        tag.color = available_colors.shift() || default_color;
      } else {
        available_colors.splice(i, 1);
      }
    }
  }

  function release_color(tag) {
    if (tag.color != default_color) {
      available_colors.push(tag.color);
    } else {
      tag.color = undefined;
    }
  }

  function intersect(a, b) {
    var list = [],
        ia = 0,
        ib = 0,
        // indices
    na = a.length,
        nb = b.length,
        va = undefined,
        vb = undefined;

    if (a.length === 0 || b.length === 0) {
      return list;
    }

    va = a[0].id;
    vb = b[0].id;
    while (true) {
      if (va < vb) {
        if (++ia === na) {
          return list;
        }
        va = a[ia].id;
      } else if (va > vb) {
        if (++ib === nb) {
          return list;
        }
        vb = b[ib].id;
      } else {
        // va == vb
        list.push(a[ia]);
        if (++ia === na || ++ib === nb) {
          return list;
        }
        va = a[ia].id;
        vb = b[ib].id;
      }
    }
  }

  function excludeItems(a, b) {
    var list = [],
        ia = 0,
        ib = 0,
        // indices
    na = a.length,
        nb = b.length,
        va = undefined,
        vb = undefined;

    if (a.length === 0 || b.length === 0) {
      return list;
    }

    va = a[0].id;
    vb = b[0].id;
    while (true) {
      if (va < vb) {
        list.push(a[ia]);
        if (++ia === na) {
          return list;
        }
        va = a[ia].id;
      } else if (va > vb) {
        if (++ib === nb) {
          // accept remaining items in a
          list.push(a[ia]);
          while (ia < na) {
            list.push(a[ia]);ia++;
          }
          return list;
        }
        vb = b[ib].id;
      } else {
        // va == vb
        // exclude va
        if (++ia === na) {
          return list;
        }
        if (++ib === nb) {
          while (ia < na) {
            list.push(a[ia]);ia++;
          }
          return list;
        }
        va = a[ia].id;
        vb = b[ib].id;
      }
    }
  }

  module.exports = function () {
    var initialDomain = undefined;
    var filteredDomain = undefined;
    var domain = [];

    var _excluded = new Set();
    var filters = new Map();
    var tagFilters = new Map();

    var tags = new Set();

    var dispatch = _d3.dispatch('changed');

    _clear(true);

    function add(tag) {
      if (tags.has(tag)) return;

      assign_color(tag);

      tags.add(tag);
      _excluded['delete'](tag);
      recompute();
    }

    function remove(tag) {
      if (!tags['delete'](tag)) return;
      release_color(tag);
      recompute();
    }

    function _clear(silent) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tag = _step.value;

          release_color(tag);
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
        for (var _iterator2 = _excluded[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tag = _step2.value;

          release_color(tag);
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

      tags = new Set();
      _excluded = new Set();
      filteredDomain = initialDomain;
      domain = initialDomain;
      if (!silent) {
        dispatch.changed();
      }
    }

    function filterDomain() {
      var _this = this;

      domain = initialDomain;
      filters.forEach(function (filter) {
        domain = filter.call(_this, domain);
      });
      filteredDomain = domain;
      recompute();
    }

    function useTag(tag) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = tagFilters.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var f = _step3.value;

          if (!f(tag)) return false;
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

      return true;
    }

    function recompute(silent) {
      domain = filteredDomain;
      tags.forEach(function (tag) {
        if (useTag(tag)) domain = intersect(domain, tag.items);
      });
      _excluded.forEach(function (tag) {
        if (useTag(tag)) domain = excludeItems(domain, tag.items);
      });

      if (!silent) dispatch.changed();
    }

    function _reset(newDomain, newTags) {
      var tag = undefined;
      var prevTags = tags;
      var prevExcluded = _excluded;
      var current = new Set();

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = newTags[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          tag = _step4.value;
          current.add(tag.concept.label);
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

      tags = new Set();
      _excluded = new Set();

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = prevTags[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          tag = _step5.value;

          if (current.has(tag.concept.label)) tags.add(tag);else release_color(tag);
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
        for (var _iterator6 = prevExcluded[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          tag = _step6.value;

          if (current.has(tag.concept.label)) _excluded.add(tag);else release_color(tag);
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

      filteredDomain = initialDomain = newDomain;
      recompute(true);
    }

    function check(domain, msg) {
      for (var i = 0; i < domain.length; i++) {
        if (domain[i] == undefined) console.log(msg, 'at', i);
      }
    }

    /*
     * API
     */
    var selection = Object.defineProperties({

      reset: function reset(newDomain, currentTags) {
        _reset(newDomain, currentTags);
      },

      update: function update() {
        dispatch.changed();
      },

      countActive: function countActive(items) {
        return intersect(domain, items).length;
      },

      selectedItems: function selectedItems() {
        return tags.size || _excluded.size ? domain : [];
      },

      clear: function clear(silent) {
        _clear(false);
      },

      exclude: function exclude(tag, add) {
        if (arguments.length == 1) {
          add = !_excluded.has(tag);
        }
        if (add) {
          if (_excluded.has(tag)) return;
          assign_color(tag);
          _excluded.add(tag);
          tags['delete'](tag);
        } else {
          if (!_excluded['delete'](tag)) return;
          release_color(tag);
        }
        recompute();
      },

      addFilter: function addFilter(filter, key) {
        filters.set(key, filter);
        filter.on('change.selection', function () {
          return filterDomain();
        });
        filterDomain();
      },

      removeFilter: function removeFilter(key) {
        var filter = filters.get(key);
        if (!filter) return;
        filter.off('change.selection');
        filters['delete'](key);
        filterDomain();
      },

      addTagsFilter: function addTagsFilter(filter, key, silence) {
        tagFilters.set(key, filter);
        filter.on('change.selection', function () {
          recompute();
        });
        recompute(silence);
      },

      removeTagsFilter: function removeTagsFilter(key) {
        var filter = tagFilters.get(key);
        if (!filter) return;

        filter.off('change.selection');
        tagFilters['delete'](key);
        recompute();
      },

      select: function select(tag, op) {
        if (op == undefined) op = !tags.has(tag);

        if (op) add(tag);else remove(tag);
      },

      selected: function selected() {
        return tags;
      },

      excluded: function excluded() {
        return _excluded;
      },

      isAnySelected: function isAnySelected() {
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = arguments[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var tag = _step7.value;

            if (tags.has(tag)) return true;
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

        return false;
        //return _.some(arguments, function (tag) {
        //    if (tags.has(tag)) return true;
        //  }, this
        //);
      },

      on: function on(type, listener) {
        dispatch.on(type, listener);
        return this;
      }
    }, {
      domain: {
        get: function () {
          return domain;
        },
        set: function (list) {
          initialDomain = list;
          _clear(false);
          //recompute(true);
        },
        configurable: true,
        enumerable: true
      }
    });

    return selection;
  };
});

//# sourceMappingURL=selection.js.map