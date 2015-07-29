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
        va = b[ib].id;
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

    var excluded = new Set();
    var filters = new Map();

    var tags = new Set();

    var dispatch = _d3.dispatch('changed');

    clear(true);

    function add(tag) {
      if (tags.has(tag)) return;

      assign_color(tag);

      tags.add(tag);
      excluded['delete'](tag);
      recompute();
    }

    function remove(tag) {
      if (!tags['delete'](tag)) return;
      release_color(tag);
      recompute();
    }

    function clear(silent) {
      tags = new Set();
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
      tags.forEach(function (tag) {
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
          clear(false);
        },
        configurable: true,
        enumerable: true
      }
    });

    selection.selectedItems = function () {
      return tags.size || excluded.size ? domain : [];
    };

    selection.clear = function (silent) {
      clear(false);
    };

    selection.exclude = function (tag, add) {
      if (add) {
        if (excluded.has(tag)) return;
        excluded.add(tag);
        tags['delete'](tag);
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
      return tags;
    };

    selection.isAnySelected = function () {
      return _.some(arguments, function (tag) {
        if (tags.has(tag)) return true;
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