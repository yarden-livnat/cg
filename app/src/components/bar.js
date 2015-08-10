define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/8/15.
   */

  'use strict';

  module.exports = function () {

    var margin = { left: 0, top: 0, right: 0, bottom: 0 };
    var max = 1;
    var width = 50,
        height = 14;
    var duration = 500;

    function widthFunc(x) {
      var x0 = x(0);
      return function (d) {
        return Math.abs(x(d) - x0);
      };
    }

    function bar(selection) {
      selection.each(function (d) {
        var x1 = _d3.scale.linear().domain([0, max]).range([0, width - margin.left - margin.right]);

        var x0 = this.__chart__ || _d3.scale.linear().domain([0, Infinity]).range(x1.range());

        var w0 = widthFunc(x0);
        var w1 = widthFunc(x1);

        var svg = _d3.select(this).selectAll('svg').data([d]);
        svg.enter().append('svg').attr('class', 'bar').append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.attr('width', width).attr('height', height);

        var range = svg.select('g').selectAll('rect').data([d.value]);

        range.enter().append('rect').attr('width', w0).attr('height', height).transition().duration(duration).attr('width', w1);

        range.transition().duration(duration).attr('width', w1).attr('height', height);

        var labels = svg.select('g').selectAll('text').data([d.value]);
        labels.enter().append('text').attr('y', 10).attr('x', function (d, i) {
          return i * (width - 20);
        });

        labels.text(function (d) {
          return d;
        });
      });
    }

    bar.width = function (x) {
      if (!arguments.length) return width;
      width = x;
      return this;
    };

    bar.max = function (v) {
      if (!arguments.length) return max;
      max = v;
      return this;
    };

    return bar;
  };
});

//# sourceMappingURL=bar.js.map