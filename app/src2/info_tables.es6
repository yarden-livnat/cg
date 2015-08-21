/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import * as postal from 'postal'

import * as patients from './patients';
import table from './components/table';

let update = () => {}; // no-op

let catTable = table('#details-tables', 'cat-table').header([
  {name: 'key', title: 'Category'},
  {name: 'value', title: '#tags', attr:'numeric'}
]).on('click', function(d) {
  patients.topics_cat.filter(d.value);
  patients.update(patients.topics_cat);
  postal.publish({channel: 'global', topic: 'render'});

});

let sysTable = table('#details-tables', 'sys-table').header([
  {name: 'key', title: 'System'},
  {name: 'value', title: '#tags', attr:'numeric'}
]).on('click', function(d) {
  patients.topics_sys.filter(d.value);
  patients.update(patients.topics_sys);
  postal.publish({channel: 'global', topic: 'render'});
});

postal.subscribe({channel: 'global', topic: 'render', callback: render});

export function init() {
}

function reset() {
}

function render() {
  catTable.data(patients.topics_cat.group().top(Infinity));
  sysTable.data(patients.topics_sys.group().top(Infinity));
}