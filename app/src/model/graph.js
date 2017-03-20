/**
 * Created by yarden on 8/25/15.
 */

import * as d3 from 'd3';
import patients from './patients';

// function shared_bak(a, b) {
//   let count = 0,
//     ia = 0, ib = 0, // indices
//     na = a.length, nb = b.length,
//     va, vb;
//
//   if (a.length === 0 || b.length === 0) { return count; }
//
//   va = a[0].id;
//   vb = b[0].id;
//   while (true) {
//     if (va < vb) {
//       if (++ia === na) { return count; }
//       va = a[ia].id;
//     } else if (va > vb) {
//       if (++ib === nb) { return count; }
//       vb = b[ib].id;
//     } else { // va== vb
//       count++;
//       if (++ia === na || ++ib === nb) { return count; }
//       va = a[ia].id;
//       vb = b[ib].id;
//     }
//   }
// }
//
// function shared(a, b) {
// 	let count = 0,
// 		ia = 0, ib = 0, // indices
// 		na = a.length, nb = b.length,
// 		va, vb;
//
// 	if (a.length === 0 || b.length === 0) { return count; }
//
// 	va = a[0];
// 	vb = b[0];
// 	while (true) {
// 		if (va < vb) {
// 			if (++ia === na) { return count; }
// 			va = a[ia];
// 		} else if (va > vb) {
// 			if (++ib === nb) { return count; }
// 			vb = b[ib];
// 		} else { // va== vb
// 			count++;
// 			if (++ia === na || ++ib === nb) { return count; }
// 			va = a[ia];
// 			vb = b[ib];
// 		}
// 	}
// }
//
//
// /*
//  * Symmetric measures
//  */
//
// function phi(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//   let f0p = N - f1p;
//   let fp0 = N - fp1;
//
//   return (N*f11 - f1p*fp1)/Math.sqrt(f1p*fp1*f0p*fp0);
// }
//
// function odds(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//   let f00 = N - f1p - fp1 + f11;
//   let f10 = f1p - f11;
//   let f01 = fp1 - f11;
//
//   return (f11*f00)/(f10*f01);
// }
//
//
// function kappa(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//   let f00 = N - f1p - fp1 + f11;
//   let f0p = N - f1p;
//   let fp0 = N - fp1;
//
//   return (N*f11 + N*f00 - f1p*fp1 - f0p*fp0)/(N*N - f1p*fp1-f0p*fp0);
// }
//
// function interest(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return (N*f11)/(f1p*fp1);
// }
//
// function cosine(a, b) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return f11/Math.sqrt(f1p*fp1);
// }
//
// function ps(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return f11/N + f1p*fp1/(N*N);
// }
//
// function collective(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//   let f00 = N - f1p - fp1 + f11;
//   let f0p = N - f1p;
//   let fp0 = N - fp1;
//
//   return (f11+f00)/(f1p*fp1 + f0p*fp0) * (N - f1p*fp1 - f0p*fp0)/(N - f11 - f00);
// }
//
// function jaccard(a, b) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return f11/(f1p+ fp1 -f11);
// }
//
// function confidence(a, b) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return f11/Math.min(f1p, fp1);
// }
//
// /*
//  * Asymemtric
//  */
//
// function Goodman_Kruskal(a, b, N) {
//
// }
//
// function mutual_information(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   let f10 = f1p-f11;
//   let f01 = fp1 - f11;
//   let f00 = N - f1p - fp1 + f11;
//   let f0p = N - f1p;
//   let fp0 = N - fp1;
//
//   function t(f, fp) { return f/N * Math.log(N*f/fp);}
//   function d(f) { return f/N * Math.log(f/N); }
//
//   let v = t(f00, f0p*f0p) + t(f01, f0p*fp1) + t(f10, f1p*fp0) + t(f11, f1p*fp1);
//   v = v / (-d(f0p) - d(f1p));
//
//   return v;
// }
//
// function laplace(a, b) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return (f11 + 1)/(f1p+2);
// }
//
// function conviction(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//   let fp0 = N - fp1;
//   let f10 = f1p - f11;
//
//   return (f1p*fp0)/(N*f10);
// }
//
// function certainty(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return (f11/f1p - fp1/N)/(1 - fp1/N);
// }
//
// function added_value(a, b, N) {
//   let f1p = a.items.length;
//   let fp1 = b.items.length;
//   let f11 = shared(a.items, b.items);
//
//   return f11/f1p - fp1/N;
// }
//
//
// function pearson(a, b) {
//
//   let r = 0, n=a.days.length;
//   for (let i=0; i<n; i++) {
//     r += a.days[i] * b.days[i];
//   }
//   r = r/((n-1)*a.var*b.var);
//   return r;
// }

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

function numberOfItems(nodes) {
  let items = new Set();
  for (let node of nodes)
    for (let item of node.items)
      items.add(item);
  return items.size;
}

function applyEdgeMeasure(nodes, edgeFunc) {
  let N = numberOfItems(nodes),
    n = nodes.length, n1 = n - 1,
      src, dest;


  let edges = [];
  for(let i = 0; i < n1; i++) {
    src = nodes[i];
    if (src.items.length == 0) continue;

    for(let j = i + 1; j < n; j++) {
      dest = nodes[j];
      let value = edgeFunc(src, dest, N);
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
  console.log(d3.extent(edges, d => d.r));
  return edges;
}

function association(f) {
  return nodes => applyEdgeMeasure(nodes,
    (s, d, N) => f(s.items, d.items, N));
}

function correlation(f) {
  return function (nodes) {

    for (let node of nodes) {
      let days = new Array(patients.datesRange.length).fill(0);
      for (let e of node.items) {
        let d = patients.encountersMap.get(e).day;
        days[d]++;
      }
      days.mean = d3.mean(days);
      days.var = 0; //d3.variance(days);
      let n = days.length;
      for (let i = 0; i < n; i++) {
        let v = days[i] - days.mean;
        days.var += v * v;
        days[i] = v;
      }
      days.var = Math.sqrt(days.var / (n - 1));
      node.days = days;
    }

    return applyEdgeMeasure(nodes,
      (s, d, N) => f(s.days, d.days, N));
  }
}

let measures = {
  node: {
    size: nodesSizeMeasure,
    category: nodesCategoryMeasure,
    system: nodesSystemMeasure
  },
  // edge: {
  //   phi: edgeMeasure(phi),
  //   odds: edgeMeasure(odds),
  //   kappa: edgeMeasure(kappa),
  //   interest: edgeMeasure(interest),
  //   cosine: edgeMeasure(cosine),
  //   ps: edgeMeasure(ps),
  //   collective: edgeMeasure(collective),
  //   jaccard: edgeMeasure(jaccard),//edgeAssociationMeasure,
  //   confidence: edgeMeasure(confidence),
  //
  //   // lambda: edgeMeasure(Goodman_Kruskal),
  //   MI: edgeMeasure(mutual_information),
  //   laplace: edgeMeasure(laplace),
  //   conviction: edgeMeasure(conviction),
  //   certainty: edgeMeasure(certainty),
  //   AV: edgeMeasure(added_value),
  //
  //   pearson: edgeCorrelationMeasure
  // }
};

export default function() {
  let nodes = [];
  let edges = [];
  let prob = null;
  let max = 0;

  let nodeFunc = measures.node.size;
  let edgeFunc = d => 0; // measures.edge.confidence;

  function recalculate() {
    //var t0 = window.performance.now();
    nodeFunc(nodes, prob);
    //var t1 = window.performance.now();
    edges = edgeFunc(nodes);
    let t2 = window.performance.now();
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

  // graph.edgeMeasure = function(name) {
    // edgeFunc = measures.edge[name];
    // edges = edgeFunc(nodes);
    // return this;
  // };

  graph.edgeMeasure = function(measure) {
    if (measure.type == 'correlation')
      edgeFunc = correlation(measure.f);
    else
      edgeFunc = association(measure.f);
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