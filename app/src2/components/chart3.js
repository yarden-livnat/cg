define(['exports', 'module', 'd3'], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/11/15.
   */

  'use strict';

  module.exports = function (el, useRight) {

    var series = undefined;
    var AXIS_OFFSET = 20;
    var margin = { top: 5, right: 5 + (hasRight && AXIS_OFFSET || 0), bottom: 15, left: 5 + AXIS_OFFSET };
    var width = 350 - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;
    var hasRight = useRight || false;
    var _title = undefined;

    var svg = undefined,
        svgContainer = undefined;

    var x = _d3.time.scale().range([0, width]).nice(_d3.time.week, 1);

    var xAxis = _d3.svg.axis().scale(x).orient('bottom').tickSize(3, 0).tickPadding(4).ticks(2);
    //.tickFormat(d3.time.format("%m/%d"));

    var y = _d3.scale.linear().range([height, 0]);

    var yAxis = _d3.svg.axis().scale(y).orient('left').tickSize(3).tickPadding(6).ticks(4);

    var yr = undefined;

    var yrAxis = undefined;
    if (hasRight) {
      yr = _d3.scale.linear().range([height, 0]);

      yrAxis = _d3.svg.axis().scale(yr).orient('right').tickSize(3).tickPadding(6).ticks(2);
    }

    var line = _d3.svg.line().x(function (d) {
      return x(d.x);
    }).y(function (d) {
      return y(d.value);
    });

    var area = _d3.svg.area().x(function (d) {
      return x(d.x);
    }).y0(height).y1(function (d) {
      return y(d.value);
    }).interpolate('cardinal');

    var zoom = _d3.behavior.zoom().on('zoom', draw);

    var selection = typeof el == 'string' ? _d3.select(el) : el;
    selection.attr('class', 'chart');

    width = parseInt(selection.style('width')) - margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;

    svgContainer = selection.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

    svg = svgContainer.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    x.range([0, width]);
    y.range([height, 0]);
    if (hasRight) {
      yr.range([height, 0]);
    }

    var xrange = x.range();
    var yrange = y.range();

    svg.append('text').attr('class', 'title').attr('x', 5).attr('y', 5).text(_title);

    svg.append('clipPath').attr('id', 'clip').append('rect').attr('x', xrange[0]).attr('y', yrange[1]).attr('width', xrange[1] - xrange[0]).attr('height', yrange[0] - yrange[1]);

    svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')');

    svg.append('g').attr('class', 'y axis').attr('transform', 'translate(0,0)');

    if (hasRight) {
      svg.append('g').attr('class', 'yr axis').attr('transform', 'translate(' + width + ',0)');
    }

    svg.append('path').attr('class', 'line').attr('clip-path', 'url(#clip');

    svg.append('rect').attr('class', 'pane').attr('width', width).attr('height', height).call(zoom);

    function _resize(w, h) {
      svgContainer.attr('width', w).attr('height', h);

      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;

      x.range([0, width]);
      xAxis.tickSize(3);

      y.range([height, 0]);
      yAxis.tickSize(3);

      if (hasRight) {
        yr.range([height, 0]);
        yrAxis.tickSize(3);
      }

      var xrange = x.range();
      var yrange = y.range();

      area.y0(y(0));

      svg.select('#clip rect').attr('x', xrange[0]).attr('y', yrange[1]).attr('width', xrange[1] - xrange[0]).attr('height', yrange[0] - yrange[1]);

      svg.select('g.x.axis').attr('transform', 'translate(0,' + height + ')');

      //svg.select('g.y.axis')
      //  .attr('transform', 'translate(' + width + ',0)');

      svg.select('g.yr.axis').attr('transform', 'translate(' + width + ',0)');

      svg.select('.pane').attr('width', width).attr('height', height).call(zoom);
    }

    function draw() {
      if (series) {
        (function () {
          svg.select('g.x.axis').call(xAxis);
          svg.select('g.y.axis').call(yAxis);
          if (hasRight) {
            svg.select('g.yr.axis').call(yrAxis);
          }

          var ly = function ly(d) {
            return y(d.value);
          };
          var ry = hasRight ? function (d) {
            return yr(d.value);
          } : ly;

          var areas = svg.selectAll('.area').data(series.filter(function (d) {
            return d.type == 'area';
          }));

          areas.enter().append('path').attr('class', 'area').attr('clip-path', 'url(#clip)');

          areas.style('fill', function (d) {
            return d.color;
          })
          //.attr('stroke-dasharray', d => { return d.marker == 'dash' ? '3' : '0'; })
          .attr('d', function (d) {
            return area(d.values);
          });

          areas.exit().remove();

          var lines = svg.selectAll('path.line').data(series.filter(function (d) {
            return d.type == 'line';
          })).attr('stroke', function (d) {
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
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = series[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var s = _step.value;

              var v = _d3.max(s.values, function (d) {
                return d.value;
              });
              if (s.right) yr_max = Math.max(yr_max, v);else y_max = Math.max(y_max, v);
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

          x.domain([x_min, x_max]);
          y.domain([0, y_max]);

          yAxis.ticks(y_max > 3 && 3 || y_max);

          if (hasRight) {
            yr.domain([0, yr_max]);
            yrAxis.ticks(yr_max > 3 && 3 || yr_max);
          }

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
        s.range([0, width]);
        x = s;
        xAxis.tickFormat(s.tickFormat());
        xAxis.scale(x);
        return this;
      }
    };
  };
});

//# sourceMappingURL=chart3.js.map