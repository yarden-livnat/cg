/**
 * Created by yarden on 8/25/15.
 */

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

function jaccard(a, b) {
  let s = shared(a, b);
  return s/(a.length + b.length -s);
}

export default function() {
  let nodes = [];
  let edges = [];
  let domain = [];

  let edgeFunc = jaccard;

  function update() {
    // domain
    domain = new Set();
    let max = 0;
    nodes.forEach( node => {
      node.items.forEach( item => domain.add(item));
      max = Math.max(max, node.items.length);
    });

    // scale nodes
    nodes.forEach( node =>
      node.scale = node.items.length/max );

    // create edges
    let n = nodes.length, n1 = n-1,
      src, dest;

    edges = [];
    for (let i=0; i<n1; i++) {
      src = nodes[i];
      if (src.items.length == 0) continue;

      for (let j=i+1; j<n; j++) {
        dest = nodes[j];
        let value = edgeFunc(src.items, dest.items);
        if (value > 0) {
          edges.push( {
            id: src.id + ':' + dest.id,
            source: src,
            target: dest,
            value: value
          });
        }
      }
    }
  }

  let graph = {};

  graph.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    update();
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
  };

  return graph;
}