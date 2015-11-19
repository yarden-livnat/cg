/**
 * Created by yarden on 10/27/15.
 */

import * as patients from './patients';
import postal from 'postal';


let dimension = patients.rel_tid;
export let selected = new Set();
export let excluded = new Set();

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

export function select(item) {
  if (!selected.delete(item)) selected.add(item);
  excluded.delete(item);
  update();
}

export function exclude(item) {
  if (!excluded.delete(item)) excluded.add(item);
  selected.delete(item);
  update();
}

export function isEmpty() {
  return selected.size == 0 && excluded.size == 0;
}

export function isSelected(item) {
  return selected.has(item);
}

export function isExcluded(item) {
  return excluded.has(item);
}


