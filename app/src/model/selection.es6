/**
 * Created by yarden on 7/12/15.
 */

import * as d3 from 'd3'

let available_colors = d3.scale.category10().range();
let default_color = "gray";

function assign_color(tag) {
  if (!tag.color) {
    tag.color = available_colors.shift() || default_color;
  } else {
    let i = available_colors.indexOf(tag.color);
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
    let list = [],
      ia = 0, ib = 0, // indices
      na = a.length, nb = b.length,
      va, vb;

    if (a.length === 0 || b.length === 0) { return list; }

    va = a[0].id;
    vb = b[0].id;
    while (true) {
      if (va < vb) {
        if (++ia === na) { return list; }
        va = a[ia].id;
      } else if (va > vb) {
        if (++ib === nb) { return list; }
        vb = b[ib].id;
      } else { // va == vb
        list.push(a[ia]);
        if (++ia === na || ++ib === nb) { return list; }
        va = a[ia].id;
        va = b[ib].id;
      }
    }
  }

  function excludeItems(a, b) {
    let list = [],
      ia = 0, ib = 0, // indices
      na = a.length, nb = b.length,
      va, vb;

    if (a.length === 0 || b.length === 0) { return list; }

    va = a[0].id;
    vb = b[0].id;
    while (true) {
      if (va < vb) {
        list.push(a[ia]);
        if (++ia === na) { return list; }
        va = a[ia].id;
      } else if (va > vb) {
        if (++ib === nb) {
          // accept remaining items in a
          list.push(a[ia]);
          while (ia < na) { list.push(a[ia]); ia++; }
          return list;
        }
        vb = b[ib].id;
      } else { // va == vb
        // exclude va
        if (++ia === na) { return list; }
        if (++ib === nb) {
          while (ia < na){ list.push(a[ia]); ia++; }
          return list;
        }
        va = a[ia].id;
        vb = b[ib].id;
      }
    }
  }

  export default function() {
    let initialDomain = undefined;
    let filteredDomain = undefined;
    let domain = [];

    let excluded = new Set();
    let filters = new Map();

    let tags = new Set();

    let dispatch = d3.dispatch('changed');

    clear(true);


    function add(tag) {
      if (tags.has(tag)) return;

      assign_color(tag);

      tags.add(tag);
      excluded.delete(tag);
      recompute();
    }

    function remove(tag) {
      if (!tags.delete(tag)) return;
      release_color(tag);
      recompute();
    }

    function clear(silent) {
      for (let tag of tags) {
        release_color(tag);
      }

      for (let tag of excluded) {
        release_color(tag);
      }

      tags = new Set();
      excluded = new Set();
      filteredDomain = initialDomain;
      domain = initialDomain;
      if (!silent) {
        dispatch.changed();
      }
    }

    function filterDomain() {
      domain = initialDomain;
      filters.forEach(filter => {domain = filter.call(this, domain)});
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
      for(let i = 0; i < domain.length; i++)
        if (domain[i] == undefined) console.log(msg, 'at', i);
    }

    /*
     * API
     */
    let selection = {
      get domain() { return domain; },

      set domain(list) {
        initialDomain = list;
        clear(false);
      }
    };

    selection.selectedItems = function() {
      return tags.size || excluded.size ? domain : [];
    };

    selection.clear = function(silent) {
      clear(false);
    };

    selection.exclude = function (tag, add) {
      if (add) {
        if (excluded.has(tag)) return;
        assign_color(tag);
        excluded.add(tag);
        tags.delete(tag);
      } else {
        if (!excluded.delete(tag)) return;
        release_color(tag);
      }
      recompute();
    };

    selection.addFilter = function (filter, key) {
      filters.set(key, filter);
      filter.on('change', () => filterDomain());
      filterDomain();
    };

    selection.removeFilter = function (key) {
      let filter = filters.get(key);
      if (!filter) return;
      filter.off('change');
      filters.delete(key);
      filterDomain();
    };

    selection.select = function (tag, op) {
      op = op || op == undefined;
      if (op) add(tag);
      else remove(tag)
    };

    selection.tags = function() {
      return tags;
    };

    selection.excluded = function() {
      return excluded;
    };

    selection.isAnySelected = function () {
      return _.some(arguments, function (tag) {
        if (tags.has(tag)) return true;
      }, this
      );
    };

    selection.on = function(type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    return selection;
  }
