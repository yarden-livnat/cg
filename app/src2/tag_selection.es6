/**
 * Created by yarden on 10/27/15.
 */

import * as patients from './patients';
import postal from 'postal';


let dimension = patients.rel_tid; //enc_tags;
let selected = new Set();
let excluded = new Set();

function accept(enc) {
  for (let s of selected)
    if (!enc.tags.has(s)) return false;
  for (let e of excluded)
    if (enc.tags.has(e)) return false;
  return true;
}

function activeTags() {
  let tags = new Set();

  for (let e of patients.encountersMap.values()) {
    if (accept(e))
      for(let t of e.tags)
        tags.add(t);
  }
  return tags;
}

let count = 0;
function filter(activeSet) {
  return function(tid) {
    if (activeSet.has(tid)) { console.log('filter: ',tid); count++;}
    return activeSet.has(tid);
  }
}

function update() {
  if (isEmpty())
    dimension.filterAll();
  else {
    let a = activeTags();
    dimension.filter( tid => a.has(tid));
  }
    //dimension.filter(filter(activeTags()));

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

//export function filter(tid) {
//  return (selected.size == 0 || selected.has(tid)) && (excluded.size == 0 || !excluded.has(tid));
//}
//
//export function filter1(eid) {
//  let enc = patients.encountersMap.get(eid);
//  for (let s of selected) if (!enc.tags.has(s)) return false;
//  for (let e of excluded) if (enc.tags.has(e)) return false;
//  return true;
//}

