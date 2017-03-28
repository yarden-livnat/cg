/**
 * Created by yarden on 3/19/17.
 */

import {mean} from 'd3';
// import  {sqrt, max, min} from 'math';
let sqrt = Math.sqrt;

let measures = [];

function shared(a, b) {
  let count = 0,
    ia = 0, ib = 0, // indices
    na = a.length, nb = b.length,
    va, vb;

  if (a.length === 0 || b.length === 0) { return count; }

  va = a[0];
  vb = b[0];
  while (true) {
    if (va < vb) {
      if (++ia === na) { return count; }
      va = a[ia];
    } else if (va > vb) {
      if (++ib === nb) { return count; }
      vb = b[ib];
    } else { // va== vb
      count++;
      if (++ia === na || ++ib === nb) { return count; }
      va = a[ia];
      vb = b[ib];
    }
  }
}


function contingency(a, b, N) {
  let f1p = a.length;
  let fp1 = b.length;
  let f11 = shared(a, b);
  let f10 = f1p - f11;
  let f01 = fp1 - f11;
  let f00 = N - f11 - f10 - f01;
  return [f11, f10, f01, f00, N];
}

function apply_measure(m) {
  if (m.type == 'correlation')
    return { type: 'correlation', f: (a, b) => m.f(a, b)};
  else
    return { f: (a, b, N) => m.f(contingency(a, b, N))};
}

/*
 * Symmetric measures
 */

function phi([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;
  let f0p = f01 + f00;
  let fp0 = f10 + f00;

  return [(N*f11 - f1p*fp1)/Math.sqrt(f1p*fp1*f0p*fp0), 0];
}
measures.push( {name: 'phi', f: phi, range:[-1,1], ind: 0} );

// function odds([f11, f10, f01, f00, N]) {
//   let f1p = a.length;
//   let fp1 = b.length;
//   let f11 = shared(a, b);
//   let f00 = N - f1p - fp1 + f11;
//   let f10 = f1p - f11;
//   let f01 = fp1 - f11;
//
//   return (f11*f00)/(f10*f01);
// }


function kappa([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;
  let f0p = f01 + f00;
  let fp0 = f10 + f00;

  return [(N*f11 + N*f00 - f1p*fp1 - f0p*fp0)/(N*N - f1p*fp1-f0p*fp0), 0];
}
measures.push( {name: 'kappa', f: kappa, range:[0,1], ind: 0} );

// function interest([f11, f10, f01, f00, N]) {
//   let f1p = a.length;
//   let fp1 = b.length;
//   let f11 = shared(a, b);
//
//   return (N*f11)/(f1p*fp1);
// }

function yule_Q([f11, f10, f01, f00, N]) {
  let p = f11*f00;
  let q = f10*f01;

  return [(p-q)/(p+q), 0];
}
measures.push( {name: 'Yule Q', f: yule_Q, range:[-1,1], ind: 0} );

function yule_Y([f11, f10, f01, f00, N]) {
  let p = sqrt(f11*f00);
  let q = sqrt(f10*f01);

  return [(p-q)/(p+q), 0];
}
measures.push( {name: 'Yule Y', f: yule_Y, range:[-1,1], ind: 0} );

function cosine([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  return [f11/Math.sqrt(f1p*fp1), 0];
}
measures.push( {name: 'cosine', f: cosine, range:[0,1], ind: 0} );

function ps([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  return [f11/N - f1p*fp1/(N*N), 0];
}
measures.push( {name: 'leverage', f: ps, range:[-1,1], ind: 0} );

// function collective([f11, f10, f01, f00, N]) {
//   let f1p = a.length;
//   let fp1 = b.length;
//   let f11 = shared(a, b);
//   let f00 = N - f1p - fp1 + f11;
//   let f0p = N - f1p;
//   let fp0 = N - fp1;
//
//   return (f11+f00)/(f1p*fp1 + f0p*fp0) * (N - f1p*fp1 - f0p*fp0)/(N - f11 - f00);
// }

function jaccard([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  return [f11/(f1p + fp1 - f11), 0];
}

measures.push( {name: 'jaccard', f: jaccard, range:[0,1], ind: 0} );


function klosgen([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  let forward = f11/f1p - fp1/N;
  let backward = f11/fp1 - fp1/N;

  return [Math.sqrt(f11/N) * Math.max(forward, backward), forward - backward];
}

measures.push( {name: 'klosgen', f: klosgen, range:
  [sqrt(2/sqrt(2)-1)*(2-sqrt(3)-1/sqrt(3)),2/(3*sqrt(3))], ind: 0} );

function confidence([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  return [f11/Math.min(f1p, fp1), f1p - fp1];
}
measures.push( {name: 'all-confidence', f: confidence, range:[0,1], ind: 0} );

/*
 * Asymemtric
 */

function Goodman_Kruskal([f11, f10, f01, f00, N]) {
}

function mutual_information([f11, f10, f01, f00, N]) {
  if (f11 == 0) return [0, 0];

  let f1p = f11 + f10;
  let fp1 = f11 + f01;
  let f0p = f01 + f00;
  let fp0 = f10 + f00;

  function t(f, fp) { return f/N * Math.log(N*f/fp);}
  function d(f) { return f/N * Math.log(f/N); }

  let v = t(f00, f0p*fp0) + t(f01, f0p*fp1) + t(f10, f1p*fp0) + t(f11, f1p*fp1);
  let da = -d(f0p) - d(f1p);
  let db = -d(fp0) - d(fp1);

  v = v / Math.min(da, db);

  return [v, da - db];
}
measures.push( {name: 'MI', f: mutual_information, range:[0,1], ind: 0} );

function J([f11, f10, f01, f00, N]) {
  if (f11 == 0) return [0, 0];

  let f1p = f11 + f10;
  let fp1 = f11 + f01;
  let f0p = f01 + f00;
  let fp0 = f10 + f00;

  let v = f11/N * Math.log(N*f11/(f1p*fp1));
  let va = v + f10/N * Math.log(N*f10/(f1p*fp0));
  let vb = v + f01/N * Math.log(N*f01/(fp1*f01));

  return [Math.max(va, vb), va - vb];
}

measures.push( {name: 'J', f: J, range:[0,1], ind: 0} );

function laplace([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  return [(f11 + 1)/Math.min(f1p+2, fp1+2), f1p - fp1];
}
measures.push( {name: 'laplace', f: laplace, range:[0,1], ind: 0} );

function conviction([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;
  let f0p = f01 + f00;
  let fp0 = f10 + f00;

  let va = (f1p*fp0)/(N*f10);
  let vb = (fp1*f0p)/(N*f01);

  return [Math.max(va, vb), va - vb];
}
// measures.push( {name: 'conviction', f: conviction, range:[0.5,Infinity], ind: 1} );


// function certainty([f11, f10, f01, f00, N]) {
//   let f1p = a.length;
//   let fp1 = b.length;
//   let f11 = shared(a, b);
//
//   return (f11/f1p - fp1/N)/(1 - fp1/N);
// }
// measures.push( {name: 'certainty', f: certainty, range:[-1,1], ind: 0} );

function added_value([f11, f10, f01, f00, N]) {
  let f1p = f11 + f10;
  let fp1 = f11 + f01;

  let va = f11/f1p - fp1/N;
  let vb = f11/fp1 - f1p/N;

  return Math.abs(va) > Math.abs(vb) ? [va, 1] : [vb, -1];
}
measures.push( {name: 'AV', f: added_value, range:[-0.5,1], ind: 0} );


function pearson(a, b) {

  init(a);
  init(b);
  let r = 0, n=a.length;
  for (let i=0; i<n; i++) {
    r += a[i] * b[i];
  }
  r = r/((n-1) * a.ss * b.ss);
  return [r, 0];

  function init(a) {
    if (a.mean) return;
    a.mean = mean(a);
    let ss = 0;  // standard score
    let n = a.length;
    for (let i = 0; i < n; i++) {
      let v = a[i] - a.mean;
      a[i] = v;
      ss += v * v;
    }
    a.ss = Math.sqrt(ss / (n - 1));
  }
}
measures.push( {name: 'pearson', f: pearson, range:[-1,1], ind: 0, type: 'correlation'} );


export {measures, apply_measure};