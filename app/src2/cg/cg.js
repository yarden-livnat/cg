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

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var nodeRenderer = (0, _renderers.NodeRenderer)().radius(_config.cgOptions.canvas.nodeRadius).scaleFunc(_config.cgOptions.canvas.nodeScale);
    //.x(x)
    //.y(y);

    var graph = (0, _Graph['default'])();
    var drag = _d32['default'].behavior.drag().origin(function (d) {
      return { x: d.x, y: d.y };
    }).on('dragstart', onDragStart).on('drag', onDrag).on('dragend', onDragEnd);

    var offsetX = undefined,
        offsetY = undefined;

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
      d3links.call(edgeRenderer.update);
    }

    function onDragEnd(d) {
      d.fixed &= ~6;
    }

    function dblclick(d) {
      _d32['default'].select(this).classed('fixed', d.fixed = false);
    }

    var container = undefined;
    var svg = undefined,
        svgLinks = undefined,
        svgNodes = undefined;

    var showEdges = false;

    var force = _d32['default'].layout.force().on('tick', updatePosition).on('end', forceDone);

    var nodesRange = [0, 1],
        edgesRange = [0.7, 1];

    var nodesSelector = (0, _Selector['default'])().width(100).height(50).select(nodesRange).on('select', function (r) {
      nodesRange = r;
      render(opt.canvas.fastDuration);
      updateEdgesSelector();
    });

    var edgesSelector = (0, _Selector['default'])().width(100).height(50).select(edgesRange).on('select', function (r) {
      edgesRange = r;render(opt.canvas.fastDuration);
    });

    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: update });

    function update() {
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
    }

    function updatePosition() {}
    function forceDone() {}

    function f(s) {
      console.log(s);
    }
    function h(s) {
      s.call(nodeRenderer);
      s.each(f);
    }

    function render(duration) {
      var d3Nodes = svgNodes.selectAll('.node').data(graph.nodes(), function (d) {
        return d.id;
      });

      var a = d3Nodes.enter()
      //.call(nodeRenderer)
      .call(h);

      d3Nodes.enter().call(nodeRenderer).select('g').attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      //.call(drag);

      //d3Nodes
      //  .transition().duration(duration)
      //    .style('opacity', 1)
      //      .call(nodeRenderer.scale);

      d3Nodes.exit().transition().duration(duration).style('opacity', 0.000001).remove();
    }

    function build(selection) {
      svg = selection.append('svg');

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
    };

    cg.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      x.domain([0, width]).range([0, width]);
      return this;
    };

    cg.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      y.domain([0, height]).range([0, height]);
      return this;
    };

    cg.dimension = function (_) {
      if (!arguments.length) return dimension;
      dimension = _;
      group = dimension.group().reduce(function (p, v) {
        p.push(v);return p;
      }, function (p, v) {
        p.splice(p.index(v), 1);return p;
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