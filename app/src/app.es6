/**
 * Created by yarden on 6/30/15.
 */

import * as xpanel from './components/xpanel'
//import * as Formater from 'formatter.js'
import * as d3 from 'd3'
import * as postal from 'postal'

import * as data from './data';
import * as query from './query';
import * as Map from './map'
import CG from './cg/cg';
import * as Info from './info/info';

import * as model from './model/models'

let map = Map();
let selection = model.selection();
let cg = CG();
let info = Info();

let preSelection;

postal.subscribe({channel:'data', topic:'pre-changed', callback: () => {
  selection.reset(data.domain, data.tags);
}});

//postal.subscribe({channel:'data', topic:'changed', callback: () => { selection.domain = data.domain; }});
postal.subscribe({channel:'data', topic:'post-changed', callback: () => {
  selection.update(); }});

postal.subscribe({channel:'data', topic:'ready', callback: () => {initModules()}});

initHTML();
data.init();


function getSize(el) {
  let d3el = d3.select(el);
  return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
}

function resize() {
  cg.resize(getSize('#cg'));
  info.resize();
}

function initHTML() {
  xpanel.init();

  //let duration_input = document.getElementById('duration-input');
  //if (duration_input) {
  //  new Formater(duration_input, {
  //    pattern: "{{99}}"
  //  });
  //}

  window.addEventListener('resize', resize);
}

function initModules() {
  query.init();

  map.population(data.population)
    .selection(selection)
    .init();

  cg.init('#cg')
    .selection(selection);

  info.init()
    .selection(selection);

  resize();
}