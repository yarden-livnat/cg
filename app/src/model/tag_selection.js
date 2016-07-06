/**
 * Created by yarden on 10/27/15.
 */

import postal from 'postal';

import patients from './patients';
import * as colors from '../utils/colors';
import {topicsMap} from '../service';

let dimension = patients.rel_tid;
let selected = new Set();
let excluded = new Set();

function accept(enc) {
  for (let s of selected)
    if (!enc.tags.has(s)) return false;
  for (let e of excluded)
    if (enc.tags.has(e)) return false;
  return true;
}

function activeEncounters() {
  let active = new Set();
  for (let enc of patients.encountersMap.values())
    if (accept(enc)) active.add(enc.id);
  return active;
}

function update() {
  if (isEmpty())
    dimension.filterAll();
  else {
    let e = activeEncounters();
    dimension.filter( entry => e.has(entry.eid) );
  }

  patients.update(dimension);
  postal.publish({channel: 'global', topic: 'render'});
}

function select(item) {
  if (!selected.delete(item)) {
    selected.add(item);
    colors.assign_color(topicsMap.get(item));
  } else {
    colors.release_color(topicsMap.get(item));
  }
  excluded.delete(item);
  update();
}

function exclude(item) {
  if (!excluded.delete(item)) {
    excluded.add(item);
    colors.assign_color(topicsMap.get(item));
  } else {
    colors.release_color(topicsMap.get(item));
  }
  selected.delete(item);
  update();
}

function isEmpty() {
  return selected.size == 0 && excluded.size == 0;
}

function isSelected(item) {
  return selected.has(item);
}

function isExcluded(item) {
  return excluded.has(item);
}

export {select, exclude, isEmpty, isSelected, isExcluded, selected, excluded}
