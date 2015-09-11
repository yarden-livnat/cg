define(['exports', 'module', 'd3', 'postal', '../config', '../service', '../components/selector', './graph', './renderers'], function (exports, module, _d3, _postal, _config, _service, _componentsSelector, _graph, _renderers) {
  /**
   * Created by yarden on 8/24/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _Selector = _interopRequireDefault(_componentsSelector);

  var _Graph = _interopRequireDefault(_graph);

  module.exports = function () {
    var width = 200,
        height = 200;
    var dimension = undefined;
    var group = undefined;

    var container = undefined;
    var svg = undefined,
        svgLinks = undefined,
        svgNodes = undefined;
    var d3Nodes = undefined,
        d3Links = undefined;

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var nodeRenderer = (0, _renderers.NodeRenderer)().radius(_config.cgOptions.canvas.nodeRadius).scaleFunc(_config.cgOptions.canvas.nodeScale);

    var edgeRenderer = (0, _renderers.EdgeRenderer)().scale(_config.cgOptions.canvas.edgeScale).opacity(_config.cgOptions.canvas.edgeOpacity).duration(_config.cgOptions.canvas.duration).x(x).y(y);

    var graph = (0, _Graph['default'])();

    var drag = _d32['default'].behavior.drag().origin(function (d) {
      return { x: d.x, y: d.y };
    }).on('dragstart', onDragStart).on('drag', onDrag).on('dragend', onDragEnd);

    var offsetX = undefined,
        offsetY = undefined;

    var showEdges = false;
    var activeNodes = [];
    var activeEdges = [];

    var force = _d32['default'].layout.force().charge(_config.cgOptions.layout.charge).friction(_config.cgOptions.layout.friction).gravity(_config.cgOptions.layout.gravity).linkStrength(function (d) {
      return d.value * _config.cgOptions.layout.linkStrength;
    }).linkDistance(function (d) {
      /*return cgOptions.layout.distScale(d.value); */return 40;
    }).on('tick', updatePosition).on('end', forceDone);

    var nodesRange = [0, 1],
        edgesRange = [0.7, 1];

    var nodesSelector = (0, _Selector['default'])().width(100).height(50).select(nodesRange).on('select', function (r) {
      nodesRange = r;
      render(_config.cgOptions.canvas.fastDuration);
      //updateEdgesSelector();
    });

    var edgesSelector = (0, _Selector['default'])().width(100).height(50).select(edgesRange).on('select', function (r) {
      edgesRange = r;render(_config.cgOptions.canvas.fastDuration);
    });

    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: update });

    function onDragStart(d, mx, my) {
      d.fixed |= 2;
      offsetX = _d32['default'].event.sourceEvent.layerX - x(d.x);
      offsetY = _d32['default'].event.sourceEvent.layerY - y(d.y);
    }

    function onDrag(d) {
      _d32['default'].select(this).classed('fixed', d.fixed |= 3);
      d.x = d.px = x.invert(_d32['default'].event.sourceEvent.layerX - offsetX);
      d.y = d.py = y.invert(_d32['default'].event.sourceEvent.layerY - offsetY);
      _d32['default'].select(this).attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      svgLinks.call(edgeRenderer.update);
    }

    function onDragEnd(d) {
      d.fixed &= ~6;
    }

    function dblclick(d) {
      _d32['default'].select(this).classed('fixed', d.fixed = false);
    }

    function update() {
      force.stop();

      var prev = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = graph.nodes()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          prev.set(node.id, node);
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

      graph.nodes(group.top(Infinity).map(function (item) {
        var topic = _service.topicsMap.get(item.key);
        var node = prev.get(topic) || {
          id: item.key,
          label: topic.label,
          topic: topic,
          x: Math.random() * width,
          y: Math.random() * height,
          scale: 1
        };

        node.items = item.value.map(function (entry) {
          return entry.enc_id;
        });
        node.items.sort(function (a, b) {
          return a - b;
        });
        return node;
      }));

      render(_config.cgOptions.canvas.duration);
      layout(_config.cgOptions.layout.initIterations);
    }

    function layout(iter) {
      force.nodes(graph.nodes()).links(graph.edges()).start();
    }

    function clamp(v, min, max) {
      return v < min ? min : v > max ? max : v;
    }

    function updatePosition() {
      if (_config.cgOptions.layout.clampToWindow) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = activeNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;

            node.x = clamp(node.x, 0, width - node.w);
            node.y = clamp(node.y, 0, height - node.h);
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
      }

      // x(), y() to account for zoom
      d3Nodes.attr('transform', function (d) {
        //if (d.label == 'Cough' && d.tag.positive) console.log('cough: ',x(d.x), y(d.y));
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      d3Links.call(edgeRenderer.update);

      // early termination
      var max = 0,
          sum = 0,
          zero = 0,
          one = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = activeNodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          var dx = Math.abs(node.x - node.px);
          var dy = Math.abs(node.y - node.py);
          var speed = Math.sqrt(dx * dx + dy + dy);
          max = Math.max(speed, max);
          sum += speed;
          if (speed == 0) zero++;
          if (speed < 1) one++;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      //var max = _.reduce(activeNodes,  function(max, node) {
      //  return Math.max(max,  Math.abs(node.x - node.px));
      //}, 0);

      //console.log('speed  n:',activeNodes.length,' max:', max,  ' avg:',sum/activeNodes.length, 'zero:', zero,  '<1:', one);
      if (max < _config.cgOptions.layout.minSpeed) {
        force.stop();
      }
    }

    function forceDone() {
      console.log('force done');
    }

    function render(duration) {
      d3Nodes = svgNodes.selectAll('.node').data(graph.nodes(), function (d) {
        return d.id;
      });

      var e = nodeRenderer(d3Nodes.enter());
      e.each(function (d) {
        console.log('f', d);
      }).attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      }).call(drag);

      d3Nodes.transition().duration(duration).style('opacity', 1).call(nodeRenderer.scale);

      d3Nodes.exit().transition().duration(duration).style('opacity', 0.000001).remove();

      d3Links = svgLinks.selectAll('.link').data(graph.edges(), function (d) {
        return d.id;
      });

      d3Links.enter().call(edgeRenderer);

      d3Links.call(edgeRenderer.update);

      d3Links.exit().transition().duration(duration).style('opacity', 0.000001).remove();
    }

    function build(selection) {
      svg = selection.append('svg').attr('class', 'cg');

      svg.append('rect').attr('class', 'overlay').attr('width', width).attr('height', Math.max(0, height - edgesSelector.height() - 10));

      /* selectors */
      var sg = svg.append('g').attr('class', 'cgSelectors');

      nodesSelector(sg.append('g').attr('class', 'nodesSelector'));

      sg.append('text').attr('transform', 'translate(20,' + (nodesSelector.height() + 5) + ')').text('topics');

      edgesSelector(sg.append('g').attr('class', 'edgesSelector').attr('transform', 'translate(' + (nodesSelector.width() + 10) + ',0)'));

      sg.append('text').attr('transform', 'translate(' + (20 + nodesSelector.width() + 10) + ',' + (nodesSelector.height() + 5) + ')').text('relations').on('click', function () {
        showEdges = !showEdges;render();
      });

      var g = svg.append('g');

      svgLinks = g.append('g').attr('class', 'links');
      svgNodes = g.append('g').attr('class', 'nodes');

      addListeners();

      return g;
    }

    function addListeners() {}

    var cg = function cg(selection) {
      build(selection);
      return cg;
    };

    cg.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      x.domain([0, width]).range([0, width]);
      svg.attr('width', width);
      svg.select('rect').attr('width', width);
      return this;
    };

    cg.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      y.domain([0, height]).range([0, height]);
      var h = Math.max(0, height - edgesSelector.height() - 10);
      svg.attr('height', height);
      svg.select('.cgSelectors').attr('transform', 'translate(10,' + h + ')');
      svg.select('rect').attr('height', h);
      return this;
    };

    cg.dimension = function (_) {
      if (!arguments.length) return dimension;
      dimension = _;
      group = dimension.group().reduce(function (p, v) {
        p.push(v);return p;
      }, function (p, v) {
        p.splice(p.indexOf(v), 1);return p;
      }, function () {
        return [];
      });
      return this;
    };

    cg.resize = function (size) {
      cg.width(size[0]).height(size[1]);
      // todo: render
    };

    return cg;
  };
});

//# sourceMappingURL=cg.js.map