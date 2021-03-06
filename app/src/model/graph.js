/**
 * Created by yarden on 8/25/15.
 */

import * as d3 from 'd3';
import patients from './patients';

function shared(a, b) {
  let count = 0,
    ia = 0, ib = 0, // indices
    na = a.length, nb = b.length,
    va, vb;

  if (a.length === 0 || b.length === 0) { return count; }

  va = a[0].id;
  vb = b[0].id;
  while (true) {
    if (va < vb) {
      if (++ia === na) { return count; }
      va = a[ia].id;
    } else if (va > vb) {
      if (++ib === nb) { return count; }
      vb = b[ib].id;
    } else { // va== vb
      count++;
      if (++ia === na || ++ib === nb) { return count; }
      va = a[ia].id;
      vb = b[ib].id;
    }
  }
}

function suggest(a, b) {
  let s = shared(a.items, b.items);
  return s/min(a.items.length, b.items.length);
}

function jaccard(a, b) {
  let s = shared(a.items, b.items);
  return s/(a.items.length + b.items.length -s);
}

function pearson(a, b) {
  let r = 0, n=a.days.length;
  for (let i=0; i<n; i++) {
    r += a.days[i] * b.days[i];
  }
  r = r/((n-1)*a.var*b.var);
  return r;
}

/*
  Node measures
 */

function nodesSizeMeasure(nodes, prob) {
  let max = 0;
  for(let node of nodes) {
    if (node.excluded) {
      node.scale = node.lastScale;
    } else {
      if (!prob) {
        node.scale = node.items.length;
      } else {
        node.scale = 0;
        for(let item of node.items) {
          node.scale += prob.get(item) || 0;
        }
      }
      max = Math.max(max, node.scale);
    }
  }

  // scale nodes
  for (let node of nodes) {
    if (!node.excluded) node.scale /= max;
  }
}

function nodesCategoryMeasure(nodes, prob) {
  nodesGroupSizeMeasure(nodes, prob, 'category');
}

function nodesSystemMeasure(nodes, prob) {
  nodesGroupSizeMeasure(nodes, prob, 'system');
}

function nodesGroupSizeMeasure(nodes, prob, group) {
  let max = {};

  for(let node of nodes) {
    if (node.excluded) node.scale = node.lastScale;
    else {
      if (prob) {
        node.scale = 0;
        for(let item of node.items) {
          node.scale += prob.get(item) || 0;
        }
      } else {
        node.scale = node.items.length;
      }
      let type = node.topic[group];
      max[type] = max[type] == undefined ? node.scale : Math.max(max[type] || 0, node.scale);
    }
  }

  // scale nodes
  for (let node of nodes) {
    if (!node.excluded)
      // node.scale = Math.log2(1 + node.scale/max[node.topic[group]]);
    node.scale /= max[node.topic[group]];
  }
}

/*
   Edge Measures
 */

function applyEdgeMeasure(nodes, edgeFunc) {
  let n = nodes.length, n1 = n - 1,
      src, dest;

  let edges = [];
  for(let i = 0; i < n1; i++) {
    src = nodes[i];
    if (src.items.length == 0) continue;

    for(let j = i + 1; j < n; j++) {
      dest = nodes[j];
      let value = edgeFunc(src, dest);
      //if (value > 0) {
        edges.push({
            id:     src.id + ':' + dest.id,
            source: src,
            target: dest,
            value:  Math.abs(value),
            r: value
          }
        );
      //}
    }
  }
  return edges;
}

function edgeAssociationMeasure(nodes) {
  return applyEdgeMeasure(nodes, jaccard);
}

function edgeCorrelationMeasure(nodes) {
  for (let node of nodes) {
    node.days = new Array(patients.datesRange.length).fill(0);
    for (let e of node.items) {
      let d = patients.encountersMap.get(e).day;
      node.days[d]++;
    }
    node.mean = d3.mean(node.days);
    node.var = 0; //d3.variance(node.days);
    let n = node.days.length;
    for (let i=0; i<n; i++) {
      let v = node.days[i] - node.mean;
      node.var += v*v;
      node.days[i] = v;
    }
    node.var = Math.sqrt(node.var/(n-1));
  }

  return applyEdgeMeasure(nodes, pearson);
}

let measures = {
  node: {
    size: nodesSizeMeasure,
    category: nodesCategoryMeasure,
    system: nodesSystemMeasure
  },
  edge: {
    association: edgeAssociationMeasure,
    pearson: edgeCorrelationMeasure
  }
};

export default function() {
  let nodes = [];
  let edges = [];
  let prob = null;
  let max = 0;

  let nodeFunc = measures.node.size;
  let edgeFunc = measures.edge.association;

  function recalculate() {
    //var t0 = window.performance.now();
    nodeFunc(nodes, prob);
    //var t1 = window.performance.now();
    edges = edgeFunc(nodes);
    var t2 = window.performance.now();
    //console.log('recalculate. nodes:', (t1-t0), ' edges:', (t2-t1));
  }

  let graph = {};

  graph.prob = function(_) {
    prob = _;
    nodeFunc(nodes, prob);
  };

  graph.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    recalculate();
    return this;
  };

  graph.edges = function(_) {
    if (!arguments.length) return edges;
    edges = _;
    return this;
  };

  graph.edgeFunc = function(f) {
    if (!arguments.length) return edgeFunc;
    edgeFunc = f;
    return this;
  };

  graph.measures = measures;

  graph.edgeMeasure = function(name) {
    edgeFunc = measures.edge[name];
    edges = edgeFunc(nodes);
    return this;
  };

  graph.nodeMeasure = function(name) {
    nodeFunc = measures.node[name];
    nodeFunc(nodes, prob);
    return this;
  };

  graph.group = function(_) {
    if (!arguments.length) return group;
    group = _;
    return this;
  };

  return graph;
}