define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/11/15.
   */

  'use strict';

  module.exports = function (el) {

    var series = undefined;
    var margin = { top: 5, right: 30, bottom: 20, left: 30 };
    var width = 350 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;

    var _title = undefined;

    var svg = undefined,
        svgContainer = undefined;

    var x = _d3.time.scale().range([0, width]).nice(_d3.time.week, 1);

    var xAxis = _d3.svg.axis().scale(x).orient('bottom').tickSize(3, 0).tickPadding(4).ticks(2);
    //.tickFormat(d3.time.format("%m/%d"));

    var y = _d3.scale.linear().range([height, 0]);

    var yAxis = _d3.svg.axis().scale(y).orient('left').tickSize(3).tickPadding(6).ticks(4);

    var yr = _d3.scale.linear().range([height, 0]);

    var yrAxis = _d3.svg.axis().scale(yr).orient('right').tickSize(3).tickPadding(6).ticks(2);

    var line = _d3.svg.line().x(function (d) {
      return x(d.x);
    }).y(function (d) {
      return y(d.value);
    });

    var zoom = _d3.behavior.zoom().on('zoom', draw);

    var selection = typeof el == 'string' ? _d3.select(el) : el;
    selection.attr('class', 'chart');

    width = parseInt(selection.style('width')) - margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;

    svgContainer = selection.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

    svg = svgContainer.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.range([0, width]);
    y.range([height, 0]);
    yr.range([height, 0]);

    var xrange = x.range();
    var yrange = y.range();

    svg.append('text').attr('class', 'title').attr('x', 5).attr('y', 5).text(_title);

    svg.append('clipPath').attr('id', 'clip').append('rect').attr('x', xrange[0]).attr('y', yrange[1]).attr('width', xrange[1] - xrange[0]).attr('height', yrange[0] - yrange[1]);

    svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')');

    svg.append('g').attr('class', 'y axis').attr('transform', 'translate(0,0)');

    svg.append('g').attr('class', 'yr axis').attr('transform', 'translate(' + width + ',0)');

    svg.append('path').attr('class', 'line').attr('clip-path', 'url(#clip');

    svg.append('rect').attr('class', 'pane').attr('width', width).attr('height', height).call(zoom);

    function _resize(w, h) {
      svgContainer.attr('width', w).attr('height', h);

      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;

      x.range([0, width]);
      y.range([height, 0]);
      yr.range([height, 0]);

      xAxis.tickSize(3);
      yAxis.tickSize(3);
      yrAxis.tickSize(3);

      var xrange = x.range();
      var yrange = y.range();

      svg.select('#clip rect').attr('x', xrange[0]).attr('y', yrange[1]).attr('width', xrange[1] - xrange[0]).attr('height', yrange[0] - yrange[1]);

      svg.select('g.x.axis').attr('transform', 'translate(0,' + height + ')');

      //svg.select('g.y.axis')
      //  .attr('transform', 'translate(' + width + ',0)');

      svg.select('g.yr.axis').attr('transform', 'translate(' + width + ',0)');

      svg.select('.pane').attr('width', width).attr('height', height).call(zoom);
    }

    function draw() {
      if (series) {
        var _iteratorNormalCompletion;

        var _didIteratorError;

        var _iteratorError;

        var _iterator, _step;

        (function () {
          var left = false,
              right = false;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;

          try {
            for (_iterator = series[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var d = _step.value;

              if (d.right) right = true;else left = true;
              if (left && right) break;
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

          svg.select('g.x.axis').call(xAxis);
          svg.select('g.y.axis').attr('visibility', left && 'visible' || 'hidden').call(yAxis);
          svg.select('g.yr.axis').attr('visibility', right && 'visible' || 'hidden').call(yrAxis);

          var ly = function ly(d) {
            return y(d.value);
          };
          var ry = function ry(d) {
            return yr(d.value);
          };

          var lines = svg.selectAll('path.line').data(series).attr('stroke', function (d) {
            return d.color;
          }).attr('stroke-dasharray', function (d) {
            return d.marker == 'dash' ? '3' : '0';
          }).attr('d', function (d) {
            return line.y(d.right ? ry : ly).interpolate(d.interpolate || 'cardinal')(d.values);
          });

          lines.exit().remove();
        })();
      }
    }

    return {
      title: function title(name) {
        _title = name;
        if (svg) svg.select('.title').text(_title);
        return this;
      },

      data: function data(list) {
        series = list;
        if (series.length > 0) {
          var n = series.length;
          var x_min = series[0].values[0].x;
          var x_max = series[0].values[series[0].values.length - 1].x;
          var y_max = 0;
          var yr_max = 0;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = series[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var s = _step2.value;

              var v = _d3.max(s.values, function (d) {
                return d.value;
              });
              if (s.right) yr_max = Math.max(yr_max, v);else y_max = Math.max(y_max, v);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          x.domain([x_min, x_max]);
          y.domain([0, y_max]);
          yr.domain([0, yr_max]);

          yAxis.ticks(y_max > 3 && 3 || y_max);
          yrAxis.ticks(yr_max > 3 && 3 || yr_max);

          zoom.x(x);
        }

        var lines = svg.selectAll('path.line').data(series).enter().append('path').attr('class', 'line').attr('clip-path', 'url(#clip)');

        draw();
        return this;
      },

      resize: function resize(size) {
        _resize(size[0], size[1]);
        draw();
        return this;
      },

      xscale: function xscale(s) {
        if (!arguments.length) return x;
        s.domain(x.domain()).range(x.range()).nice(5);
        x = s;
        xAxis.scale(x);
        return this;
      }
    };
  };
});

//# sourceMappingURL=chart2.js.map