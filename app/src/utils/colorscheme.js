/**
 * Created by yarden on 7/7/16.
 */

import * as d3 from 'd3';
import {schemeSet1, schemeSet2} from 'd3-scale-chromatic';

class Scheme {
  constructor() {
    this.schemes = new Map();
    this.schemes.set('category',
      d3.scaleOrdinal(schemeSet1)
      .domain(['pathogen', 'sign', 'symptom', 'syndrome']));
    this.schemes.set('system', d3.scaleOrdinal(schemeSet2)
      .domain(['constitutional', 'gastrointestinal', 'neurological', 'respiratory']));
    this.schemes.set('black', () => 'black');

    this.current = 'category';
  }

  set current(_) {
    let c = this.schemes.get(_);
    if (c) {}
      this._current = _;
      this._color = c;
  }

  get current() { return this._current; }

  scheme(_) { return this.schemes.get(_); }

  color(_) { return this._color(typeof _ == 'string' ? _ : _[this._current]); }
}

export default new Scheme();

// let schemes = new Map();
//
// schemes.set('category', d3.scaleOrdinal(schemeSet1)
//     .domain(['pathogen', 'sign', 'symptom', 'syndrome']));
//
// schemes.set('system', d3.scaleOrdinal(schemeSet2)
//   .domain(['constitutional', 'gastrointestinal', 'neurological', 'respiratory']));
//
// schemes.set('black', () => 'black');
//
// let currentScheme =
// let currentColor;
//
// export default {
//   get scheme() { return currentScheme; },
//
//   set scheme(_) {
//     if (schemes.has(_)) {
//       currentScheme = _;
//       currentColor = scheme.get(_);
//     }
//   },
//
//   color: currentColor;
// }