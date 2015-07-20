define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 7/12/15.
   */

  'use strict';

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

    va = a[0];
    vb = b[0];
    while (true) {
      if (va < vb) {
        if (++ia === na) {
          return list;
        }
        va = a[ia];
      } else if (va > vb) {
        if (++ib === nb) {
          return list;
        }
        vb = b[ib];
      } else {
        // va == vb
        list.push(va);
        if (++ia === na || ++ib === nb) {
          return list;
        }
        va = a[ia];
        va = b[ib];
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

    va = a[0];
    vb = b[0];
    while (true) {
      if (va < vb) {
        list.push(va);
        if (++ia === na) {
          return list;
        }
        va = a[ia];
      } else if (va > vb) {
        if (++ib === nb) {
          // accept remaining items in a
          list.push(va);
          while (ia < na) {
            list.push(a[ia]);ia++;
          }
          return list;
        }
        vb = b[ib];
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
        va = a[ia];
        vb = b[ib];
      }
    }
  }

  module.exports = function () {
    var initialDomain = undefined;
    var filteredDomain = undefined;
    var domain = [];

    var excluded = new Set();
    var filters = new Map();

    var currentTags = new Set();

    var dispatch = _d3.dispatch('changed');

    clear(true);

    function add(tag) {
      if (currentTags.has(tag)) return;

      currentTags.add(tag);
      excluded['delete'](tag);
      recompute();
    }

    function remove(tag) {
      if (!currentTags['delete'](tag)) return;
      recompute();
    }

    function clear(silent) {
      currentTags = new Set();
      excluded = new Set();
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
      currentTags.forEach(function (tag) {
        domain = intersect(domain, tag.items);
      });
      excluded.forEach(function (tag) {
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
    var selection = Object.defineProperties({}, {
      domain: {
        get: function () {
          return domain;
        },
        set: function (list) {
          initialDomain = list;
          clear(true);
        },
        configurable: true,
        enumerable: true
      }
    });

    selection.clear = function (silent) {
      clear(silent);
    };

    selection.exclude = function (tag, add) {
      if (add) {
        if (excluded.has(tag)) return;
        excluded.add(tag);
        currentTags['delete'](tag);
      } else {
        if (!excluded['delete'](tag)) return;
      }
      recompute();
    };

    selection.addFilter = function (filter, key) {
      filters.set(key, filter);
      filter.on('change', function () {
        return filterDomain();
      });
      filterDomain();
    };

    selection.removeFilter = function (key) {
      var filter = filters.get(key);
      if (!filter) return;
      filter.off('change');
      filters['delete'](key);
      filterDomain();
    };

    selection.select = function (tag, op) {
      op = op || op == undefined;
      if (op) add(tag);else remove(tag);
    };

    selection.tags = function () {
      return currentTags;
    };

    selection.isAnySelected = function () {
      return _.some(arguments, function (tag) {
        if (currentTags.has(tag)) return true;
      }, this);
    };

    selection.on = function (type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    return selection;
  };
});

//# sourceMappingURL=selection.js.map