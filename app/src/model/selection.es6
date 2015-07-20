/**
 * Created by yarden on 7/12/15.
 */

import * as d3 from 'd3'

  function intersect(a, b) {
    let list = [],
      ia = 0, ib = 0, // indices
      na = a.length, nb = b.length,
      va, vb;

    if (a.length === 0 || b.length === 0) { return list; }

    va = a[0];
    vb = b[0];
    while (true) {
      if (va < vb) {
        if (++ia === na) { return list; }
        va = a[ia];
      } else if (va > vb) {
        if (++ib === nb) { return list; }
        vb = b[ib];
      } else { // va == vb
        list.push(va);
        if (++ia === na || ++ib === nb) { return list; }
        va = a[ia];
        va = b[ib];
      }
    }
  }

  function excludeItems(a, b) {
    let list = [],
      ia = 0, ib = 0, // indices
      na = a.length, nb = b.length,
      va, vb;

    if (a.length === 0 || b.length === 0) { return list; }

    va = a[0];
    vb = b[0];
    while (true) {
      if (va < vb) {
        list.push(va);
        if (++ia === na) { return list; }
        va = a[ia];
      } else if (va > vb) {
        if (++ib === nb) {
          // accept remaining items in a
          list.push(va);
          while (ia < na) { list.push(a[ia]); ia++; }
          return list;
        }
        vb = b[ib];
      } else { // va == vb
        // exclude va
        if (++ia === na) { return list; }
        if (++ib === nb) {
          while (ia < na){ list.push(a[ia]); ia++; }
          return list;
        }
        va = a[ia];
        vb = b[ib];
      }
    }
  }

  export default function() {
    let initialDomain = undefined;
    let filteredDomain = undefined;
    let domain = [];

    let excluded = new Set();
    let filters = new Map();

    let currentTags = new Set();

    let dispatch = d3.dispatch('changed');

    clear(true);


    function add(tag) {
      if (currentTags.has(tag)) return;

      currentTags.add(tag);
      excluded.delete(tag);
      recompute();
    }

    function remove(tag) {
      if (!currentTags.delete(tag)) return;
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
      domain = initialDomain;
      filters.forEach(filter => {domain = filter.call(this, domain)});
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
        clear(true);
      }
    };


    selection.clear = function(silent) {
      clear(silent);
    };

    selection.exclude = function (tag, add) {
      if (add) {
        if (excluded.has(tag)) return;
        excluded.add(tag);
        currentTags.delete(tag);
      } else {
        if (!excluded.delete(tag)) return;
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
      return currentTags;
    };

    selection.isAnySelected = function () {
      return _.some(arguments, function (tag) {
        if (currentTags.has(tag)) return true;
      }, this
      );
    };

    selection.on = function(type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    return selection;
  }
