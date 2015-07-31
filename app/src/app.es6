/**
 * Created by yarden on 6/30/15.
 */

import * as xpanel from './components/xpanel'
import * as Formater from 'formatter'
import * as d3 from 'd3'
import * as postal from 'postal'

import * as data from './services/data';
import * as query from 'query';
import * as Map from 'map/map'
import CG from 'cg/cg';
import * as Info from 'info';

import * as model from 'model/models'

let map = Map();
let selection = model.selection();
let cg = CG();
let info = Info();

postal.subscribe({channel:'data', topic:'changed', callback: () => { selection.domain = data.domain; }});

postal.subscribe({channel:'data', topic:'ready', callback: () => {initModules()}});

initHTML();
data.init();


function getSize(el) {
  let d3el = d3.select(el);
  let w = parseInt(d3el.style('width'));
  let h = parseInt(d3el.style('height'));

  console.log('resize '+el+': '+parseInt(d3el.style('width')) +'x'+ parseInt(d3el.style('height')));

  return [parseInt(d3el.style('width')), parseInt(d3el.style('height'))];
}

function resize() {
  cg.resize(getSize('#cg'));
  info.resize();
}

function initHTML() {
  xpanel.init();

  let duration_input = document.getElementById('duration-input');
  if (duration_input) {
    new Formater(duration_input, {
      pattern: "{{99}}"
    });
  }

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