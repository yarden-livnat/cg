/**
 * Created by yarden on 7/21/15.
 */

import * as c3 from 'c3'

import * as data from 'services/data'
import * as table from 'components/table'
import * as chart from 'components/chart'
import * as postal from 'postal'

export default function(opt) {
  let selection;

  let tagsTable = table().el(d3.select('#tags-table').select('table'))
    .columns([{title: 'Tag', name: 'name'}, 'n']);

  let summary = chart().el('#summary-chart');

  function init() {
    postal.subscribe({channel:'data', topic:'changed', callback: dataChanged});
  }

  function dataChanged() {
    tagsTable.data(data.tags.map(tag => {
      return {
        name: tag.concept.label,
        n: tag.items.length
      }
    }));


    let perDay = [];
    data.domain.forEach( enc => {

    });
    summary.data();
  }

  function selectionChanged() {
    //selection.domain
  }


  let api = {};

  api.init = function() {
    init();
    return this;
  };

  api.selection = function(s) {
    selection = s;
    selection.on('changed', selectionChanged);
    return this;
  };

  return api;
}