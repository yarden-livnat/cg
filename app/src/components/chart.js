define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 7/23/15.
   */

  'use strict';

  module.exports = function () {

    var data = undefined;
    var margin = { top: 10, right: 60, bottom: 30, left: 20 };
    var width = 350 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    var svg = undefined,
        svgContainer = undefined;

    var x = _d3.time.scale().range([0, width]).nice(5);

    var y = _d3.scale.linear().range([height, 0]);

    var xAxis = _d3.svg.axis().scale(x).orient('bottom').tickSize(-height, 0).tickPadding(6).ticks(4);

    var yAxis = _d3.svg.axis().scale(y).orient('right').tickSize(-width).tickPadding(6).ticks(4);

    //let area = d3.svg.area()
    //  .interpolate('step-after')
    //  .x( d => { return x(d.date); })
    //  .y0(y(0))
    //  .y1( d => { return y(d.value); });

    var line = _d3.svg.line().interpolate('step-after').x(function (d) {
      return x(d.date);
    }).y(function (d) {
      return y(d.value);
    });

    var zoom = _d3.behavior.zoom().on('zoom', draw);

    var gradient = undefined;

    function resize(w, h) {
      svgContainer.attr('width', w).attr('height', h);

      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      x.range([0, width]);
      y.range([height, 0]);

      xAxis.tickSize(-width);
      yAxis.tickSize(-width);

      var xr = x.range();
      var yr = y.range();
      svg.select('#clip rect').attr('x', xr[0]).attr('y', yr[1]).attr('width', xr[1] - xr[0]).attr('height', yr[0] - yr[1]);

      svg.select('g.y.axis').attr('transform', 'translate(' + width + ',0)');

      svg.select('g.x.axis').attr('transform', 'translate(0,' + height + ')');

      svg.select('.pane').attr('width', width).attr('height', height).call(zoom);
    }

    function init() {
      gradient = svg.append('defs').append('linearGradient').attr('id', 'gradient').attr('x2', '0%').attr('y2', '100%');

      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', 0.5);

      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#999').attr('stop-opacity', 1);

      svg.append('clipPath').attr('id', 'clip').append('rect').attr('x', x(0)).attr('y', y(1)).attr('width', x(1) - x(0)).attr('height', y(0) - y(1));

      svg.append('g').attr('class', 'y axis').attr('transform', 'translate(' + width + ',0)');

      //svg.append('path')
      //  .attr('class', 'area')
      //  .attr('clip-path', 'url(#clip)')
      //  .style('fill', 'url(#gradient)');

      svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')');

      svg.append('path').attr('class', 'line').attr('clip-path', 'url(#clip)');

      svg.append('rect').attr('class', 'pane').attr('width', width).attr('height', height).call(zoom);
    }

    function draw() {
      if (data) {
        svg.select('g.x.axis').call(xAxis);
        svg.select('g.y.axis').call(yAxis);

        //svg.select('path.area').attr('d', area);
        svg.select('path.line').attr('d', line);
      }
    }

    function api() {}

    api.el = function (el, opt) {
      var selection = typeof el == 'string' ? _d3.select(el) : el;
      selection.attr('class', 'chart');

      svgContainer = selection.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

      svg = svgContainer.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      init();
      return this;
    };

    api.resize = function (w, h) {
      resize(w, h);
      if (data) draw();
    };

    api.data = function (series) {
      data = series;
      var n = series.length;
      var x_min = series[0].values[0].date;
      var x_max = series[0].values[series[0].values.length - 1].date;
      var y_max = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = series[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var s = _step.value;

          y_max = Math.max(y_max, _d3.max(s.values, function (d) {
            return d.value;
          }));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      //x.domain([d3.min(data, d => { return d.date; }), d3.max(data, d => { return d.date; })]);
      //y.domain([0, d3.max(data, d => { return d.value; })]);
      x.domain([x_min, x_max]);
      y.domain([0, y_max]);
      zoom.x(x);

      //svg.select('path.area').data([data]);
      svg.select('path.line').data([data]);

      draw();
      return this;
    };

    api.resize = function (size) {
      resize(size[0], size[1]);
      draw();
      return this;
    };

    return api;
  };
});

//# sourceMappingURL=chart.js.map