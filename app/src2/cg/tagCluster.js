define(['exports', 'module', 'd3', 'postal', '../config', '../service', './../components/Selector', './../graph'], function (exports, module, _d3, _postal, _config, _service, _componentsSelector, _graph) {
  /**
   * Created by yarden on 8/25/15.
   */
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

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

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
      graph.nodes().forEach(function (node) {
        return prev.set(node.id, node);
      });

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

    function render(duration) {
      var d3Nodes = svgNodes.selectAll('.node').data(graph.nodes(), function (d) {
        return d.id;
      });

      d3Nodes.enter().call(Node);

      d3Nodes.transition().duration(duration).style('opacity', 1).select('.scaledTag').call(scaleNode);

      d3Nodes.exit().transition().duration(duration).style('opacity', 0.000001).remove();
    }

    function Node() {
      var g = this.append('g').attr('class', 'node').style('opacity', 0.1)
      //.on('mousedown', mousedown)
      //.on('mouseup', mouseup)
      //.on("dblclick", dblclick)
      ;

      g.append('circle').attr('class', 'circle').attr('r', _config.cgOptions.canvas.nodeRadius);

      var tag = g.append('g').attr('class', 'tag');

      var scaled = tag.append('g').attr('class', 'scaledTag');

      var frame = scaled.append('g').classed('frame', true).style('opacity', 0)
      //.attr('visibility', 'hidden')
      ;

      frame.append('rect').classed('border', true);

      frame.append('rect').classed('bg', true);

      scaled.append('text').attr('class', 'tag').attr('stroke', function (d) {
        return d.color;
      }).attr('fill', function (d) {
        return d.color;
      }).attr('dy', '.35em').attr('text-anchor', 'start').text(function (d) {
        return d.label;
      });

      scaled.each(function (d) {
        var text = this.childNodes[1];
        var bbox = text.getBBox();

        d.w = bbox.width;
        d.h = bbox.height;

        _d32['default'].select(this).select('.bg').attr('width', bbox.width - 2).attr('height', bbox.height - 2).attr('x', bbox.x + 1).attr('y', bbox.y + 1);

        _d32['default'].select(this).select('.border').attr('width', bbox.width).attr('height', bbox.height).attr('y', bbox.y);
      });

      scaled.call(scaleNode);

      g.attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      g.call(drag);
    }

    function scaleNode(node) {
      node.attr('transform', function (d) {
        return 'translate(7, 0) scale(' + _config.cgOptions.canvas.nodeScale(d.scale) + ')';
      });
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
      return this;
    };

    cg.height = function (_) {
      if (!arguments.length) return height;
      height = _;
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
      width = size[0];
      height = size[1];
    };

    return cg;
  };
});

//.on('mouseover', mouseover)
//.on('mouseout', mouseout)

//# sourceMappingURL=tagCluster.js.map