define(['exports', 'module', 'lodash'], function (exports, module, _lodash) {
  /**
   * Created by yarden on 12/11/14.
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

  function caseScaling(nodes) {
    var max = _lodash._.reduce(nodes, function (max, d) {
      return Math.max(max, d.items.length);
    }, 0);

    _lodash._.each(nodes, function (node) {
      node.scale = node.items.length / max;
    });
  }

  function probScaling(nodes, prob, N) {
    var max = 0;
    _lodash._.each(nodes, function (node) {
      var n = node.items.length;
      if (n == 0) {
        node.scale = 0;
        node['var'] = 0;
      } else {
        var sum = _lodash._.reduce(node.items, function (sum, i) {
          return sum + prob[i].prob;
        }, 0);
        max = Math.max(max, sum);
        node.scale = sum;
        //node.var = _.reduce(node.items, function (sum, i) {
        //    let v = prob[i].prob - avg;
        //    return sum + v * v;
        //}, 0) / n;
      }
    });

    _lodash._.each(nodes, function (node) {
      node.scale /= max;
    });
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

  module.exports = function () {
    var domain = [];
    var nodes = [];
    var edges = [];
    var prob = [];

    function createEdges() {
      var i = undefined,
          j = undefined,
          n = nodes.length,
          n1 = n - 1,
          src = undefined,
          dest = undefined,
          value = undefined;

      var min = -1,
          max = 0,
          total = 0;
      var hist = [];
      edges = [];
      for (i = 0; i < n1; i++) {
        src = nodes[i];
        var c = 0;
        for (j = i + 1; j < n; j++) {
          dest = nodes[j];
          value = jaccard(src.items, dest.items);
          if (value > 0) {
            edges.push({
              id: src.id + ':' + dest.id,
              source: src,
              target: dest,
              value: value
            });
            c++;
          }
        }
        //hist[]
        if (min == -1 || c < min) {
          min = c;
        }
        if (max < c) {
          max = c;
        }
        total += c;
      }
      //console.log('min:', min, ' max:', max, ' avg:', total/n);
    }

    function rescale() {
      caseScaling(nodes);
      //probScaling(nodes,  prob, domain.length);
    }

    /*
     * api
     */

    var graph = Object.defineProperties({}, {
      node: {
        get: function () {
          return nodes;
        },
        configurable: true,
        enumerable: true
      },
      edge: {
        get: function () {
          return edges;
        },
        configurable: true,
        enumerable: true
      },
      domain: {
        set: function (list) {
          if (domain == list) return;

          domain = list;

          var node = undefined,
              i = nodes.length;
          while (--i > -1) {
            node = nodes[i];
            node.items = domain == undefined ? node.tag.items : intersect(domain, node.tag.items);
          }
          rescale();
          createEdges();
        },
        configurable: true,
        enumerable: true
      }
    });

    graph.update = function (data) {
      nodes = data;
      rescale();
      createEdges();
    };

    return graph;
  };
});

//# sourceMappingURL=graph.js.map