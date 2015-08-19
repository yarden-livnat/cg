define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/12/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  module.exports = function () {

    var margin = { top: 20, right: 10, bottom: 10, left: 20 },
        width = 200 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom,
        dx = 5,
        duration = 500,
        svg = undefined,
        data = undefined,
        _series = undefined,
        handle = undefined,
        dispatch = _d32['default'].dispatch('brushed');

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, width]);

    var y = _d32['default'].scale.linear().domain([0, 1]).rangeRound([height, 0]);

    var xAxis = _d32['default'].svg.axis().scale(x).orient('bottom').ticks(5);

    var yAxis = _d32['default'].svg.axis().scale(y).orient('left').ticks(4);

    var brush = _d32['default'].svg.brush().x(x).on('brush', brushed);

    function brushed() {
      var e = brush.extent();
      dispatch.brushed(e[0], e[1]);
    }

    function draw() {
      if (svg == undefined) return;

      svg.select('.x').call(xAxis);

      svg.select('.y').call(yAxis);

      var bar = svg.selectAll('.bar').data(data, function (d, i) {
        return d.x;
      });

      var enter = bar.enter().append('rect').attr('class', 'bar').attr('y', height).attr('height', 0);

      bar.attr('x', function (d) {
        return x(d.x);
      }).attr('width', dx).transition().duration(duration).attr('y', function (d) {
        return y(d.y);
      }).attr('height', function (d) {
        return height - y(d.y);
      });

      bar.exit().remove();
    }

    function histogram(selection) {
      svg = selection.append('g').attr('class', 'histogram').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g').append('rect').attr('width', width).attr('height', height).style('fill', 'steelblue').style('opacity', 0);

      handle = svg.append('g').attr('class', 'brush').call(brush);

      handle.selectAll('rect').attr('height', height);

      svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);

      svg.append('g').attr('class', 'y axis').call(yAxis);
    }

    histogram.width = function (w) {
      if (!arguments.length) return width + margin.left + margin.right;
      width = w - margin.left - margin.right;
      x.range([0, width]);

      draw();
      return histogram;
    };

    histogram.height = function (h) {
      if (!arguments.length) return height + margin.top + margin.bottom;
      height = h - margin.top - margin.bottom;
      y.rangeRound([height, 0]);
      yAxis.ticks(Math.max(2, height / 50));
      if (handle) {
        handle.selectAll('rect').attr('height', height);
      }

      draw();
      return histogram;
    };

    histogram.margin = function (m) {
      if (!arguments.length) return margin;
      svg.attr('translate', 'transform(' + (m.left - margin.left) + ',' + (m.top - margin.top) + ')');
      margin = m;
      return histogram;
    };

    histogram.data = function (series) {
      _series = series;
      data = _d32['default'].layout.histogram().range(x.domain()).bins(x.ticks(20))(series);

      dx = data.length > 0 ? data[0].dx : 5;
      var min = x.domain()[0];
      dx = x(min + dx) - 1;
      //console.log('dx:',dx, ' x(dx):', x(dx));
      y.domain([0, _d32['default'].max(data, function (d) {
        return d.y;
      })]);

      draw();
      return histogram;
    };

    histogram.xdomain = function (from, to) {
      x.domain([from, to]);
      var save = duration;duration = 0;
      this.data(_series);
      duration = save;
    };

    histogram.on = function (type, listener) {
      dispatch.on(type, listener);
      return histogram;
    };

    return histogram;
  };

  ;
});

//# sourceMappingURL=histogram.js.map