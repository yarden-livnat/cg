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
    var prob = null;
    var max = 0;

    var edgeFunc = jaccard;

    function updateNodes() {
      max = 0;
      if (prob) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var node = _step.value;

            node.scale = 0;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = node.items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var item = _step2.value;

                node.scale += prob.get(item);
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

            max = Math.max(max, node.scale);
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
      } else {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var node = _step3.value;

            node.scale = node.items.length;
            max = Math.max(max, node.scale);
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
      }

      // scale nodes
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var node = _step4.value;

          node.scale /= max;
          //nodes.forEach( node => node.scale /= max );
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
    }

    function recalculate() {
      updateNodes();

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

    var graph = {};;

    graph.prob = function (_) {
      prob = _;
      updateNodes();
    };

    graph.nodes = function (_) {
      if (!arguments.length) return nodes;
      nodes = _;
      recalculate();
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