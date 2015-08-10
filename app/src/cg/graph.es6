/**
 * Created by yarden on 12/11/14.
 */

import {_} from 'lodash'

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


function caseScaling(nodes) {
  let max = _.reduce(nodes,  function(max, d) { return Math.max(max,  d.items.length); }, 0);

  _.each(nodes, function(node) {
    node.scale = node.items.length/max;
  });
}

function probScaling(nodes, prob, N) {
  let max = 0;
  _.each(nodes,  function(node) {
    let n = node.items.length;
    if (n == 0) {
      node.scale = 0;
      node.var = 0;
    } else {
      let sum = _.reduce(node.items, function (sum, i) { return sum + prob[i].prob; }, 0);
      max = Math.max(max, sum);
      node.scale = sum;
      //node.var = _.reduce(node.items, function (sum, i) {
      //    let v = prob[i].prob - avg;
      //    return sum + v * v;
      //}, 0) / n;
    }
  });

  _.each(nodes,  function(node) {
    node.scale /= max;
  });
}

function intersect(a, b) {
  let list = [],
      ia = 0, ib = 0, // indices
      na = a.length, nb = b.length,
      va, vb;

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
    } else { // va == vb
      list.push(a[ia]);
      if (++ia === na || ++ib === nb) {
        return list;
      }
      va = a[ia].id;
      va = b[ib].id;
    }
  }
}

export default function() {
  let domain = [];
  let nodes = [];
  let edges = [];
  let prob = [];

  function createEdges() {
    let i, j, n = nodes.length, n1 = n - 1,
        src, dest, value;

    let min = -1, max = 0, total = 0;
    let hist = [];
    edges = [];
    for(i = 0; i < n1; i++) {
      src = nodes[i];
      let c = 0;
      for(j = i + 1; j < n; j++) {
        dest = nodes[j];
        value = jaccard(src.items, dest.items);
        if (value > 0) {
          edges.push({
              id:     src.id + ':' + dest.id,
              source: src,
              target: dest,
              value:  value
            }
          );
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

  var graph = {
    get nodes() { return nodes; },
    get edges() { return edges; },

    set domain(list) {
      if (domain == list) return;

      domain = list;

      let node, i = nodes.length;
      while (--i > -1) {
        node = nodes[i];
        node.items = domain == undefined ? node.tag.items : intersect(domain, node.tag.items);
      }
      rescale();
      createEdges();
    }
  };

  graph.update = function (data) {
    let current = new Map();
    nodes.forEach(function(node) { current.set(node.id, node); });

    nodes = data;
    for (let node of node) {
      node.scale = 1.0;
      node.visible = true;
      node.selected = false;

      let cn = current.get(node.id);
      if (cn) {
        node.x = cn.x;
        node.y = cn.y;
        node.selected = cn.selected;
        node.excluded = cn.excluded;
      }
      //color: tag.positive ? opt.POS_COLOR : opt.NEG_COLOR;
    }
    rescale();
    createEdges();
  };

  return graph;
}