/**
 * Created by yarden on 7/21/15.
 */

import * as c3 from 'c3'

import * as data from 'data'

export default function(opt) {
  let selection;

  let summary = c3.generate({
    bindto: '#summary-chart',
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2', 50, 20, 10, 40, 15, 25]
      ],
      axes: {
        data2: 'y2' // ADD
      }
    },
    axis: {
      y2: {
        show: true // ADD
      }
    }
  });

  function selectionChanged() {
    //selection.domain
  }


  let api = {};

  api.init = function() {
    return this;
  };

  api.selection = function(s) {
    selection = s;
    selection.on('changed', selectionChanged);
    return this;
  };

  return api;
}