define(['exports', 'module', '../patients'], function (exports, module, _patients) {
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
    var s = shared(a.items, b.item);
    return s / (a.items.length + b.items.length - s);
  }

  function pearson(a, b) {
    var r = 0,
        n = a.days.length;
    for (var i = 0; i < n; i++) {
      r += a.days[i] * b.days[i];
    }
    r = r / ((n - 1) * a['var'] * b['var']);
    return r;
  }

  /*
    Node measures
   */

  function nodesSizeMeasure(nodes, prob) {
    var max = 0;
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

              node.scale += prob.get(item) || 0;
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

  /*
     Edge Measures
   */

  function applyEdgeMeasure(nodes, edgeFunc) {
    var n = nodes.length,
        n1 = n - 1,
        src = undefined,
        dest = undefined;

    var edges = [];
    for (var i = 0; i < n1; i++) {
      src = nodes[i];
      if (src.items.length == 0) continue;

      for (var j = i + 1; j < n; j++) {
        dest = nodes[j];
        var value = edgeFunc(src, dest);
        //if (value > 0) {
        edges.push({
          id: src.id + ':' + dest.id,
          source: src,
          target: dest,
          value: Math.abs(value),
          r: value
        });
        //}
      }
    }
    return edges;
  }

  function edgeAssociationMeasure(nodes) {
    return applyEdgeMeasure(nodes, jaccard);
  }

  function edgeCorrelationMeasure(nodes) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var node = _step5.value;

        node.days = Array(_patients.datesRange.length).fill(0);
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = node.items[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var e = _step6.value;

            var d = _patients.encountersMap.get(e).day;
            node.days[d]++;
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

        node.mean = d3.mean(node.days);
        node['var'] = 0; //d3.variance(node.days);
        var n = node.days.length;
        for (var i = 0; i < n; i++) {
          var v = node.days[i] - node.mean;
          node['var'] += v * v;
          node.days[i] = v;
        }
        node['var'] = Math.sqrt(node['var'] / (n - 1));
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

    return applyEdgeMeasure(nodes, pearson);
  }

  var measures = {
    node: {
      size: nodesSizeMeasure
    },
    edge: {
      association: edgeAssociationMeasure,
      pearson: edgeCorrelationMeasure
    }
  };

  module.exports = function () {
    var nodes = [];
    var edges = [];
    var prob = null;
    var max = 0;

    var nodesFunc = measures.node.size;
    var edgeFunc = measures.edge.pearson;

    function recalculate() {
      nodesFunc(nodes, prob);
      edges = edgeFunc(nodes);
    }

    var graph = {};

    graph.prob = function (_) {
      prob = _;
      nodesFunc(nodes, prob);
    };

    graph.node = function (_) {
      if (!arguments.length) return nodes;
      nodes = _;
      recalculate();
      return this;
    };

    graph.edge = function (_) {
      if (!arguments.length) return edges;
      edges = _;
      return this;
    };

    graph.edgeFunc = function (f) {
      if (!arguments.length) return edgeFunc;
      edgeFunc = f;
    };

    graph.measures = measures;

    return graph;
  };
});

//# sourceMappingURL=graph.js.map