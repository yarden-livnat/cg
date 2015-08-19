define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/18/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  module.exports = function (options) {

    var margin = { top: 5, right: 25, bottom: 15, left: 5 };

    var width = 200 - margin.right - margin.left;
    var height = 100 - margin.top - margin.bottom;

    var stack = _d32['default'].layout.stack().offset('wiggle').values(function (d) {
      return d.values;
    });

    var color = ['#ff8c00', '#98abc5'];

    var x = _d32['default'].scale.linear().domain([0.5, 1]).range([0, width]);

    var y = _d32['default'].scale.linear().range([height, 0]);

    var xAxis = _d32['default'].svg.axis().scale(x).orient('bottom').ticks(5);

    var yAxis = _d32['default'].svg.axis().scale(y).orient('left').ticks(3);

    var detector = function detector(selection) {
      selection.each(function (d) {
        var num = d.data.length;
        var max = _d32['default'].max(d.data, function (v) {
          return v.p + v.s;
        });
        y.domain([0, max]);

        var svg = _d32['default'].select(this).select('g');

        svg.select('x.axis').call(xAxis);
        svg.select('y.axis').call(yAxis);

        var columns = svg.selectAll('.col').data(d.data).enter().append('g').attr('class', 'col').attr('transform', function (d) {
          return 'translate(' + x(d.x) + '0)';
        });

        var bars = columns.selectAll('rect').data(function (d) {
          return [{ y0: 0, y1: d.p }, { y0: d.p, y1: d.p + d.s }];
        });

        bars.enter().append('rect').attr('class', 'bar')
        //.attr('x', d => x(d.x))
        .attr('y', function (d) {
          return d.y1;
        }).attr('width', width / num).attr('height', function (d) {
          return y(d.y0) - y(d.y1);
        }).attr('fill', function (d, i) {
          return color[i];
        });

        bars.transition().attr('y', function (d) {
          return y(d.y0 + d.y);
        }).attr('y', function (d) {
          return d.y1;
        }).attr('height', function (d) {
          return y(d.y0) - y(d.y1);
        });
      });
    };

    detector.build = function (selection) {
      width = parseInt(selection.style('width')) - margin.left - margin.right;
      height = parseInt(selection.style('height')) - margin.top - margin.bottom;

      var g = selection.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      g.append('text').attr('class', 'title').attr('x', 5).attr('y', 5).text(function (d) {
        return d.name;
      });

      g.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis).append('text').attr('dy', '0.7em').attr('text-anchor', 'end').text('probability');

      g.append('g').attr('class', 'y axis').call(yAxis);

      return this;
    };

    detector.width = function (w) {
      if (!arguments.length) return width + margin.left + margin.right;
      width = w - margin.left - margin.right;
      x.range([0, width]);
      return this;
    };

    detector.height = function (h) {
      if (!arguments.length) return height + margin.top + margin.bottom;
      height = h - margin.top - margin.bottom;
      y.range([height, 0]);
      return this;
    };

    return detector;
  };
});

//# sourceMappingURL=detector.js.map