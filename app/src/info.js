define(['exports', 'module', 'services/data', 'components/table', 'components/chart', 'postal'], function (exports, module, _servicesData, _componentsTable, _componentsChart, _postal) {
  /**
   * Created by yarden on 7/21/15.
   */

  'use strict';

  module.exports = function (opt) {
    var MIN_Y = 5;
    var CHART_MAX_WIDTH = 500;

    var selection = undefined;

    var tagsTable = (0, _componentsTable)().el(d3.select('#tags-table')).columns([{ title: 'Tag', name: 'name' }, 'n']);

    var summary = (0, _componentsChart)().el('#summary-chart');

    function init() {
      _postal.subscribe({ channel: 'data', topic: 'changed', callback: dataChanged });
    }

    function dataChanged() {
      tagsTable.data(_servicesData.tags.map(function (tag) {
        return {
          name: tag.concept.label,
          n: tag.items.length
        };
      }));

      summary.data(binData(_servicesData.domain));
    }

    function binData(items) {
      var f = d3.time.day.ceil(_servicesData.fromDate),
          t = d3.time.day.offset(d3.time.day.ceil(_servicesData.toDate), 1),
          range = d3.time.day.range(f, t),
          scale = d3.time.scale().domain([f, t]).rangeRound([0, Math.max(range.length, MIN_Y)]); // hack: rangeRound still give fraction if range is 0-1

      var bins = range.map(function (day) {
        return { date: day, value: 0, items: [] };
      });

      items.forEach(function (item) {
        var i = scale(item.date);
        console.log(item.date + '  scale=' + i);
        bins[i].value++;
        bins[i].items.push(item);
      });

      return bins;
    }

    function selectionChanged() {}

    var api = {};

    api.init = function () {
      init();
      return this;
    };

    api.selection = function (s) {
      selection = s;
      selection.on('changed', selectionChanged);
      return this;
    };

    api.resize = function (size) {
      var w = Math.min(size[0] - parseInt(d3.select('#tags-table').style('width')), CHART_MAX_WIDTH);
      d3.select('#summary-chart').attr('width', w).attr('height', size[1]);
      summary.resize([w, size[1]]);
      return this;
    };

    return api;
  };
});

//selection.domain

//# sourceMappingURL=info.js.map