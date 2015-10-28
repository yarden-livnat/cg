define(['exports', 'module', 'd3', 'postal', '../config', '../service', '../tag_selection', '../components/selector', './graph', './renderers'], function (exports, module, _d3, _postal, _config, _service, _tag_selection, _componentsSelector, _graph, _renderers) {
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

    var container = undefined,
        svg = undefined,
        svgLinks = undefined,
        svgNodes = undefined,
        overlay = undefined;
    var d3Nodes = undefined,
        d3Links = undefined;

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var nodeRenderer = (0, _renderers.NodeRenderer)().radius(_config.cgOptions.canvas.nodeRadius).scaleFunc(_config.cgOptions.canvas.nodeScale);

    var edgeRenderer = (0, _renderers.EdgeRenderer)().scale(_config.cgOptions.canvas.edgeScale).opacity(_config.cgOptions.canvas.edgeOpacity).duration(_config.cgOptions.canvas.duration).x(x).y(y);

    var graph = (0, _Graph['default'])();

    var drag = _d32['default'].behavior.drag().origin(function (d) {
      return { x: d.x, y: d.y };
    }).on('dragstart', onNodeDragStart).on('drag', onNodeDrag).on('dragend', onNodeDragEnd);

    var offsetX = undefined,
        offsetY = undefined;

    var showEdges = false;
    var activeNodes = [];
    var activeEdges = [];

    var force = _d32['default'].layout.force().charge(_config.cgOptions.layout.charge).friction(_config.cgOptions.layout.friction).gravity(_config.cgOptions.layout.gravity).linkStrength(function (d) {
      return d.value * _config.cgOptions.layout.linkStrength;
    }).linkDistance(function (d) {
      /*return cgOptions.layout.distScale(d.value); */
      return 40;
    }).on('tick', updatePosition).on('end', forceDone);

    /*
     * Nodes and Edge Selectors
     */

    var nodesRange = [0, 1],
        edgesRange = [0.7, 1];

    var nodesSelector = (0, _Selector['default'])().width(100).height(50).select(nodesRange).on('select', function (r) {
      nodesRange = r;
      render(_config.cgOptions.canvas.fastDuration);
      updateEdgesSelector();
    });

    var edgesSelector = (0, _Selector['default'])().width(100).height(50).select(edgesRange).on('select', function (r) {
      edgesRange = r;
      render(_config.cgOptions.canvas.fastDuration);
    });

    function updateNodesSelector() {
      var values = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = graph.nodes()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          if (node.items.length > 0) values.push(node.scale);
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

      nodesSelector.data(values);
    }

    function updateEdgesSelector() {
      var active = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = graph.edges()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;

          if (edge.source.visible && edge.target.visible) active.push(edge.value);
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

      edgesSelector.data(active);
    }

    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: update });
    _postal2['default'].subscribe({ channel: 'global', topic: 'data.changed', callback: onDataChanged });

    /* nodes behavior */
    function onNodeDragStart(d, mx, my) {
      d.fixed |= 2;
      offsetX = _d32['default'].event.sourceEvent.layerX - x(d.x);
      offsetY = _d32['default'].event.sourceEvent.layerY - y(d.y);
    }

    function onNodeDrag(d) {
      console.log('on drag');
      _d32['default'].select(this).classed('fixed', d.fixed |= 3);
      d.x = d.px = x.invert(_d32['default'].event.sourceEvent.layerX - offsetX);
      d.y = d.py = y.invert(_d32['default'].event.sourceEvent.layerY - offsetY);
      _d32['default'].select(this).attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      d3Links.call(edgeRenderer.update);
    }

    function onNodeDragEnd(d) {
      d.fixed &= ~6;
    }

    //function onNodeDblclick(d) {
    //  d3.select(this).classed("fixed", d.fixed = false);
    //}

    /* zoom behavior*/
    var zoom = undefined;

    function disableZoom() {
      overlay.on('mousedown.zoom', null).on('wheel.zoom', null);
    }

    function enableZoom() {
      overlay.call(zoom);
    }

    function onZoom() {
      d3Nodes.attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      d3Links.call(edgeRenderer.update);
    }

    function update() {
      force.stop();

      var prev = new Map();
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph.nodes()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          prev.set(node.id, node);
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
      updateNodesSelector();
      updateEdgesSelector();
    }

    function onDataChanged() {
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
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = activeNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var node = _step4.value;

            node.x = clamp(node.x, 0, width - node.w);
            node.y = clamp(node.y, 0, height - node.h);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4['return']) {
              _iterator4['return']();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      // x(), y() to account for zoom
      d3Nodes.attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });

      d3Links.call(edgeRenderer.update);

      // early termination
      var max = 0,
          sum = 0,
          zero = 0,
          one = 0;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = activeNodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var node = _step5.value;

          var dx = Math.abs(node.x - node.px);
          var dy = Math.abs(node.y - node.py);
          var speed = Math.sqrt(dx * dx + dy + dy);
          max = Math.max(speed, max);
          sum += speed;
          if (speed == 0) zero++;
          if (speed < 1) one++;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
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

      console.log('render');

      var activeNodes = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = graph.nodes()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var node = _step6.value;

          node.visible = node.items.length > 0 && node.scale >= nodesRange[0] && node.scale <= nodesRange[1];
          node.selected = _tag_selection.isSelected(node.id);
          node.excluded = _tag_selection.isExcluded(node.id);
          if (node.visible) activeNodes.push(node);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      d3Nodes = svgNodes.selectAll('.node').data(activeNodes, function (d) {
        return d.id;
      });

      var newNodes = nodeRenderer(d3Nodes.enter());
      node_behavior(newNodes);

      newNodes.attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      //.call(drag);

      d3Nodes.select('text').classed('excluded', function (d) {
        return d.excluded;
      });

      d3Nodes.transition().duration(duration).style('opacity', 1).call(nodeRenderer.update);

      d3Nodes.exit().transition().duration(duration).style('opacity', 0.000001).remove();

      var activeEdges = showEdges && graph.edges().filter(function (edge) {
        return edge.source.visible && edge.target.visible && edge.value >= edgesRange[0] && edge.value <= edgesRange[1];
      }) || [];

      d3Links = svgLinks.selectAll('.link').data(activeEdges, function (d) {
        return d.id;
      });

      d3Links.enter().call(edgeRenderer);

      d3Links.call(edgeRenderer.update);

      d3Links.exit().transition().duration(duration).style('opacity', 0.000001).remove();
    }

    /* interactions */
    var mouse_time = Date.now();

    function node_behavior(selection) {
      selection.on('mousedown', node_mousedown).on('mouseup', node_mouseup).on('dblclick', node_dblclick).call(drag);
    }

    function node_mousedown(d) {
      mouse_time = Date.now();
      disableZoom();
    }

    function node_mouseup(d) {
      enableZoom();

      var dt = Date.now() - mouse_time;
      if (dt < 200) {
        force.stop();
        //if (d3.event.metaKey)       { d3.select(this).classed("fixed", d.fixed = false); }
        if (_d32['default'].event.metaKey) {
          _tag_selection.exclude(d.topic.id);
        } else {
          _tag_selection.select(d.topic.id);
        }
      }
    }

    function node_dblclick(d) {
      _d32['default'].select(this).classed('fixed', d.fixed = false);
    }

    /* init */
    function build(selection) {
      svg = selection.append('svg').attr('class', 'cg');

      var g = svg.append('g');

      overlay = g.append('rect').attr('class', 'overlay').attr('width', width).attr('height', Math.max(0, height - edgesSelector.height() - 10));

      /* selectors */
      var sg = g.append('g').attr('class', 'cgSelectors');

      nodesSelector(sg.append('g').attr('class', 'nodesSelector'));

      sg.append('text').attr('transform', 'translate(20,' + (nodesSelector.height() + 5) + ')').text('topics');

      edgesSelector(sg.append('g').attr('class', 'edgesSelector').attr('transform', 'translate(' + (nodesSelector.width() + 10) + ',0)'));

      sg.append('text').attr('transform', 'translate(' + (20 + nodesSelector.width() + 10) + ',' + (nodesSelector.height() + 5) + ')').text('relations').on('click', function () {
        showEdges = !showEdges;render(_config.cgOptions.canvas.fastDuration);
      });

      /* graph */
      svgLinks = g.append('g').attr('class', 'links');
      svgNodes = g.append('g').attr('class', 'nodes');

      /* behavior */
      zoom = _d32['default'].behavior.zoom().x(x).y(y).scaleExtent([0.5, 20]).on('zoom', onZoom);
      overlay.call(zoom);

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
      zoom = _d32['default'].behavior.zoom().x(x).y(y).scaleExtent([0.5, 8]).on('zoom', onZoom);
      svg.attr('width', width);
      overlay.attr('width', width).call(zoom);

      return this;
    };

    cg.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      y.domain([0, height]).range([0, height]);
      zoom = _d32['default'].behavior.zoom().x(x).y(y).scaleExtent([0.5, 8]).on('zoom', onZoom);

      var h = Math.max(0, height - edgesSelector.height() - 10);
      svg.attr('height', height);
      svg.select('.cgSelectors').attr('transform', 'translate(10,' + h + ')');

      overlay.attr('height', h).call(zoom);

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