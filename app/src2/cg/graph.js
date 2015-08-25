define(['exports', 'module'], function (exports, module) {
  /**
   * Created by yarden on 8/25/15.
   */

  'use strict';

  function shared(a, b) {
    var count = 0,
        ia = 0,
        ib = 0,
        // indices
    na = a.length,
        nb = b.length,
        va = undefined,
        vb = undefined;

    if (a.length === 0 || b.length === 0) {
      return count;
    }

    va = a[0].id;
    vb = b[0].id;
    while (true) {
      if (va < vb) {
        if (++ia === na) {
          return count;
        }
        va = a[ia].id;
      } else if (va > vb) {
        if (++ib === nb) {
          return count;
        }
        vb = b[ib].id;
      } else {
        // va== vb
        count++;
        if (++ia === na || ++ib === nb) {
          return count;
        }
        va = a[ia].id;
        vb = b[ib].id;
      }
    }
  }

  function jaccard(a, b) {
    var s = shared(a, b);
    return s / (a.length + b.length - s);
  }

  module.exports = function () {
    var nodes = [];
    var edges = [];
    var domain = [];

    var edgeFunc = jaccard;

    function update() {
      // domain
      domain = new Set();
      nodes.forEach(function (node) {
        return node.items.forEach(function (item) {
          return domain.add(item);
        });
      });

      // scale nodes
      var max = domain.length;
      nodes.forEach(function (node) {
        return node.scale = node.items.length / max;
      });

      // create edges
      var n = nodes.length,
          n1 = n - 1,
          src = undefined,
          dest = undefined;

      edges = [];
      for (var i = 0; i < n1; i++) {
        src = nodes[i];
        if (src.items.length == 0) continue;

        for (var j = i + 1; j < n; j++) {
          dest = nodes[j];
          var value = edgeFunc(src.items, dest.items);
          if (value > 0) {
            edges.push({
              id: src.id + ':' + dest.id,
              source: src,
              target: dest,
              value: value
            });
          }
        }
      }
    }

    var graph = {};

    graph.nodes = function (_) {
      if (!arguments.length) return nodes;
      nodes = _;
      update();
      return this;
    };

    graph.edges = function (_) {
      if (!arguments.length) return edges;
      edges = _;
      return this;
    };

    graph.edgeFunc = function (f) {
      if (!arguments.length) return edgeFunc;
      edgeFunc = f;
    };

    return graph;
  };
});

//# sourceMappingURL=graph.js.map