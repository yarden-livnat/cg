/**
 * Created by yarden on 7/7/16.
 */

import * as d3 from 'd3';
import {schemeSet1, schemeSet2} from 'd3-scale-chromatic';

class Scheme {
  constructor() {
    this.map = new Map();
    this.map.set('category',
      d3.scaleOrdinal(schemeSet1)
      .domain(['pathogen', 'sign', 'symptom', 'syndrome']));
    this.map.set('system', d3.scaleOrdinal(schemeSet2)
      .domain(['constitutional', 'gastrointestinal', 'neurological', 'respiratory']));
    this.map.set('black', () => 'black');

    this.current = 'category';
  }

  set current(_) {
    let c = this.map.get(_);
    if (c) {}
      this._current = _;
      this._color = c;
  }

  get current() { return this._current; }

  scheme(_) { return this.map.get(_); }

  schemes() { return this.map.keys(); }

  color(_) { return this._color(typeof _ == 'string' ? _ : _[this._current]); }
}

export default new Scheme();

// let map = new Map();
//
// map.set('category', d3.scaleOrdinal(schemeSet1)
//     .domain(['pathogen', 'sign', 'symptom', 'syndrome']));
//
// map.set('system', d3.scaleOrdinal(schemeSet2)
//   .domain(['constitutional', 'gastrointestinal', 'neurological', 'respiratory']));
//
// map.set('black', () => 'black');
//
// let currentScheme =
// let currentColor;
//
// export default {
//   get scheme() { return currentScheme; },
//
//   set scheme(_) {
//     if (map.has(_)) {
//       currentScheme = _;
//       currentColor = scheme.get(_);
//     }
//   },
//
//   color: currentColor;
// }