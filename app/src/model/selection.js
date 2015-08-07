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

    var _tags = new Set();

    var dispatch = _d3.dispatch('changed');

    _clear(true);

    function add(tag) {
      if (_tags.has(tag)) return;

      assign_color(tag);

      _tags.add(tag);
      _excluded['delete'](tag);
      recompute();
    }

    function remove(tag) {
      if (!_tags['delete'](tag)) return;
      release_color(tag);
      recompute();
    }

    function _clear(silent) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

      _tags = new Set();
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

    function recompute() {
      domain = filteredDomain;
      _tags.forEach(function (tag) {
        domain = intersect(domain, tag.items);
      });
      _excluded.forEach(function (tag) {
        domain = excludeItems(domain, tag.items);
      });

      dispatch.changed();
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

      countActive: function countActive(items) {
        return intersect(domain, items).length;
      },

      selectedItems: function selectedItems() {
        return _tags.size || _excluded.size ? domain : [];
      },

      clear: function clear(silent) {
        _clear(false);
      },

      exclude: function exclude(tag, add) {
        if (add) {
          if (_excluded.has(tag)) return;
          assign_color(tag);
          _excluded.add(tag);
          _tags['delete'](tag);
        } else {
          if (!_excluded['delete'](tag)) return;
          release_color(tag);
        }
        recompute();
      },

      addFilter: function addFilter(filter, key) {
        filters.set(key, filter);
        filter.on('change', function () {
          return filterDomain();
        });
        filterDomain();
      },

      removeFilter: function removeFilter(key) {
        var filter = filters.get(key);
        if (!filter) return;
        filter.off('change');
        filters['delete'](key);
        filterDomain();
      },

      select: function select(tag, op) {
        op = op || op == undefined;
        if (op) add(tag);else remove(tag);
      },

      tags: function tags() {
        return _tags;
      },

      excluded: function excluded() {
        return _excluded;
      },

      isAnySelected: function isAnySelected() {
        return _.some(arguments, function (tag) {
          if (_tags.has(tag)) return true;
        }, this);
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
        },
        configurable: true,
        enumerable: true
      }
    });

    return selection;
  };
});

//# sourceMappingURL=selection.js.map