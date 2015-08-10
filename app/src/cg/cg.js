define(['exports', 'module', 'd3', 'postal', 'lodash', '../data', '../config', './graph'], function (exports, module, _d3, _postal, _lodash, _data, _config, _graph) {
  /**
   * Created by yarden on 12/17/14.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  var _Graph = _interopRequireDefault(_graph);

  var ctrl = _postal2['default'].channel('cg');

  module.exports = function () {
    var width = undefined,
        height = undefined,
        svgContainer = undefined,
        svg = undefined,
        svgNodes = undefined,
        svgLinks = undefined,
        force = _d32['default'].layout.force(),
        d3nodes = undefined,
        d3links = undefined,
        activeNodes = undefined,
        activeEdges = undefined,
        prevVisible = null,
        partialLayout = new Set(),
        selection = undefined,
        graph = (0, _Graph['default'])();

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    /*
     * rendering
     */

    function visibleNodes() {
      return graph.nodes.filter(function (node) {
        return node.visible || node.excluded;
      });
    }

    function visibleEdges() {
      if (_config.cg.canvas.showEdges == 'none') return [];

      var all = _config.cg.canvas.showEdges == 'all';
      var range = _config.cg.canvas.edgeValueSelection;
      return graph.edges.filter(function (edge) {
        return edge.source.visible && edge.target.visible && (all || selection.isAnySelected(edge.source.tag, edge.target.tag)) && (edge.value >= range[0] && edge.value <= range[1]);
      });
    }

    function render(duration) {
      // mark visible nodes
      graph.nodes.forEach(function (node) {
        node.visible = node.items.length > 0 || node.excluded;
        if (node.excluded) {
          node.scale = node.lastScale;
        }
      });

      activeNodes = visibleNodes();
      d3nodes = svgNodes.selectAll('.node').data(activeNodes, function (d) {
        return d.id;
      });

      d3nodes.enter().call(Node);

      d3nodes.transition().duration(duration).style('opacity', 1).select('.scaledTag').call(scaleNode);

      d3nodes.exit().transition().duration(duration).style('opacity', 0.000001).remove();

      // edges
      d3links = svgLinks.selectAll('.link').data(visibleEdges(), function (d) {
        return d.id;
      });

      d3links.enter().call(edgeRenderer.render);

      d3links.call(edgeRenderer.update);

      d3links.exit().transition().duration(duration).style('opacity', 0.000001).remove();
    }

    /*
     * Interactions
     */

    var drag = _d32['default'].behavior.drag().origin(function (d) {
      return { x: d.x, y: d.y };
    }).on('dragstart', onDragStart).on('drag', onDrag).on('dragend', onDragEnd);

    var offsetX, offsetY;

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

    var mouse_time = Date.now();

    function mousedown(d) {
      mouse_time = Date.now();
      disableZoom();
    }

    function mouseup(d) {
      enableZoom();

      var dt = Date.now() - mouse_time;
      if (dt < 200) {
        if (_d32['default'].event.metaKey) {
          _d32['default'].select(this).classed('fixed', d.fixed = false);
        } else if (_d32['default'].event.shiftKey) {
          excludeNode.call(this, d);
        } else {
          selectNode.call(this, d);
        }
      }
    }

    function mouseover(d) {
      _d32['default'].select(this.parentNode).select('text').transition().duration(_config.cg.canvas.duration).attr('transform', 'translate(7, 0) scale(1)');
    }

    function mouseout(d) {
      _d32['default'].select(this.parentNode).select('text').transition().duration(_config.cg.canvas.duration).call(scaleNode);
    }

    /*
     * Selection
     */
    function selectNode(d) {
      force.stop();

      //d.selected = !d.selected;
      //d3.select(this).classed('selected', d.selected);

      // TODO: check what the preVisible is all about
      //if (!d.selected  && partialLayout.delete(d.tag)) {
      //  prevVisible = _.filter(graph.nodes, function(node) { return node.visible; });
      //} else {
      //  prevVisible = null;
      //}
      //
      //if (d.selected && d.excluded) {
      //  d.excluded = false;
      //  d3.select(this).classed('excluded', false);
      //}
      //d3.select(this).select('.frame')
      //  .transition()
      //  .duration(opt.canvas.duration)
      //  .style('opacity', d.selected ? 1 : 0);

      selection.select(d.tag, !d.selected);
    }

    function excludeNode(d) {
      force.stop();

      //d.excluded = !d.excluded;
      //d3.select(this).classed('excluded', d.excluded);
      //
      //if (d.excluded && d.selected) {
      //  d.selected = false;
      //  d3.select(this).classed('selected', false);
      //}
      //if (d.excluded) {
      //  d.lastScale = d.scale;
      //}

      //d3.select(this).select('.frame')
      //  .transition()
      //  .duration(opt.canvas.duration)
      //  .style('opacity', d.excluded ? 1 : 0);

      selection.exclude(d.tag, !d.excluded);
    }

    function selectionChanged() {
      if (graph == undefined) return;
      graph.domain = selection.domain;

      var tag = undefined,
          state = new Map();
      var changed = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = selection.tags()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          tag = _step.value;
          state.set(tag, 'selected');
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = selection.excluded()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          tag = _step2.value;
          state.set(tag, 'excluded');
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

      prevVisible = null;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          var s = state.get(node.tag);
          if (!s) {
            if (node.selected || node.excluded) {
              node.selected = node.excluded = false;
              changed.push(node);
            }
          }if (node.selected != (s == 'selected') || node.excluded != (s == 'excluded')) {
            if (!node.selected && s == 'selected' && partialLayout['delete'](node.tag)) {
              prevVisible = _lodash.filter(graph.nodes, function (node) {
                return node.visible;
              });
            }
            node.selected = s == 'selected';
            node.excluded = s == 'excluded';
            changed.push(node);
          }
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

      svgNodes.selectAll('.node').data(changed, function (d) {
        return d.id;
      }).classed('selected', function (d) {
        return d.selected;
      }).classed('excluded', function (d) {
        return d.excluded;
      }).select('.frame').transition().duration(_config.cg.canvas.duration).style('opacity', function (d) {
        return d.selected || d.excluded ? 1 : 0;
      });

      if (prevVisible) {
        adjustLayout();
        prevVisible = null;
      }
      render(_config.cg.canvas.duration);
    }

    /*
     * layout
     */

    var exec_forceDone = false;
    var clock = (function () {
      var t = [];
      var l = [];

      function clock() {}

      clock.start = function () {
        t = [Date.now()];l = ['start'];
      };

      clock.mark = function (label) {
        t.push(Date.now());
        l.push(label);
      };

      clock.print = function () {};
      return clock;
    })();

    function relayout(iter) {
      selection.tags().forEach(function (tag) {
        partialLayout.add(tag);
      });

      iter = iter || 0;

      activeNodes = graph.nodes.filter(function (node) {
        return node.visible;
      });
      activeEdges = graph.edges;

      if (_config.cg.layout.onlyVisibleEdges) {
        var edgeStrength = _config.cg.canvas.edgeStrength;
        activeEdges = activeEdges.filter(function (edge) {
          return edge.source.visible && edge.target.visible
          //&& edge.value > edgeStrength
          ;
        });
      }

      exec_forceDone = true;
      clock.start();
      force.nodes(activeNodes).links(activeEdges).on('tick', null).on('end', forceDone).start();

      // reduce visible cloud movements
      clock.mark('loop');
      for (var i = 0; i < iter; ++i) force.tick();

      clock.mark('update');
      force.on('tick', updatePosition);
      clock.mark('after update');
    }

    function forceDone() {
      //console.log('force done ', exec_forceDone);
      if (!exec_forceDone) return;

      exec_forceDone = false;

      if (_config.cg.layout.nudge) {
        nudge();
      }
      clock.mark('force done');
      clock.print();

      _lodash.forEach(graph.nodes, function (n) {
        n.px = x;n.py = y;
      });
    }

    function adjustLayout() {
      console.log('adjust layout');
      var notFixed = _lodash.filter(prevVisible, function (node) {
        return !(node.fixed & 1);
      });
      _lodash.forEach(notFixed, function (node) {
        node.fixed |= 1;
      });

      graph.nodes.forEach(function (node) {
        node.visible = node.items.length > 0 || node.excluded;
        if (node.excluded) {
          node.scale = node.lastScale;
        }
      });

      var nodes = _lodash.filter(graph.nodes, function (node) {
        return node.visible;
      });
      var edges = _lodash.filter(graph.edges, function (edge) {
        return edge.source.visible && edge.target.visible;
      });

      force.nodes(nodes).links(edges).on('tick', null).on('end', null).start();

      for (var i = 0; i < 250; i++) force.tick();

      force.stop();

      _lodash.forEach(notFixed, function (node) {
        node.fixed &= ~1;
      });
      _lodash.forEach(graph.nodes, function (n) {
        n.px = x;n.py = y;
      });
      updatePosition();
    }

    function clamp(v, min, max) {
      return v < min ? min : v > max ? max : v;
    }

    function updatePosition() {
      //nudge_once();
      //console.log('update pos');

      if (_config.cg.layout.clampToWindow) {
        _lodash.forEach(activeNodes, function (node) {
          node.x = clamp(node.x, 0, width - node.w);
          node.y = clamp(node.y, 0, height - node.h);
        });
      }

      // x(), y() to account for zoom
      d3nodes.attr('transform', function (d) {
        //if (d.label == 'Cough' && d.tag.positive) console.log('cough: ',x(d.x), y(d.y));
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      d3links.call(edgeRenderer.update);

      // early termination
      var max = 0,
          sum = 0,
          zero = 0,
          one = 0;
      _lodash.each(activeNodes, function (node) {
        var dx = Math.abs(node.x - node.px);
        var dy = Math.abs(node.y - node.py);
        var speed = Math.sqrt(dx * dx + dy + dy);
        max = Math.max(speed, max);
        sum += speed;
        if (speed == 0) zero++;
        if (speed < 1) one++;
      });

      //var max = _.reduce(activeNodes,  function(max, node) {
      //  return Math.max(max,  Math.abs(node.x - node.px));
      //}, 0);

      //console.log('speed  n:',activeNodes.length,' max:', max,  ' avg:',sum/activeNodes.length, 'zero:', zero,  '<1:', one);
      if (max < _config.cg.layout.minSpeed) {
        force.stop();
      }
    }

    function label(node) {
      return node.tag.positive ? node.label : node.label + '_N';
    }

    function intersect(b1, b2) {
      // note: top and bottom are reversed (y points down)
      return !(b1.x + b1.w < b2.x || b2.x + b2.w < b1.x || b1.y + b1.h < b2.y || b2.y + b2.h < b1.y);
    }

    var bboxes;
    var d_max, d_sum;

    function show(flag) {
      if (bboxes == undefined) bboxes = activeNodes;
      var data = [];
      var n = bboxes.length;
      if (flag) {
        while (n--) {
          var i = n;
          while (i--) {
            if (intersect(bboxes[n].bbox, bboxes[i].bbox)) {
              data.push(bboxes[n]);
              if (data.indexOf(bboxes[i]) == -1) data.push(bboxes[i]);
            }
          }
        }
      }
      var o = svg.selectAll('.check').data(data, function (d) {
        return d.id;
      });

      o.enter().append('rect').attr('class', 'check').attr('width', function (d) {
        return d.bbox.w;
      }).attr('height', function (d) {
        return d.bbox.h;
      });

      o.attr('transform', function (d) {
        return 'translate(' + d.bbox.x + ',' + d.bbox.y + ')';
      });

      o.exit().remove();
    }

    function nudge() {
      computeBboxes();
      show(_config.cg['control'].overlap);
      _d32['default'].timer(function () {
        var r = nudge_step();
        updatePosition();
        return r;
      });
    }

    function nudge_once() {
      if (_config.cg.layout.nudge) {
        computeBboxes();
        nudge_step();
      }
    }

    function nudge_step() {
      bboxes = activeNodes;
      var n = bboxes.length;
      var i,
          c = 0;

      d_max = d_sum = 0;
      while (n--) {
        i = n;
        while (i--) {
          if (intersect(bboxes[n].bbox, bboxes[i].bbox)) {
            repel(bboxes[n], bboxes[i]);
            c++;
          }
        }
      }

      //console.log('found', c, d_max,  d_sum/c);

      var done = c == 0 || d_max < 1;
      show(!done && _config.cg['control'].overlap);

      return done;
    }

    function repel(n1, n2) {

      var dx = n1.bbox.x + n1.bbox.w / 2 - (n2.bbox.x + n2.bbox.w / 2);
      var dy = n1.bbox.y + n1.bbox.h / 2 - (n2.bbox.y + n2.bbox.h / 2);

      var rx = (n1.bbox.w + n2.bbox.w) / 2;
      var ry = (n1.bbox.h + n2.bbox.h) / 2;

      var adx = Math.abs(dx);
      var ady = Math.abs(dy);

      var s = n1.scale / (n1.scale + n2.scale);

      // X
      var d = Math.min(4, Math.max(0.3 * (rx - adx), 1));
      if (dx < 0) d = -d;

      var dsx = d * (1 - s);
      n1.bbox.x += dsx;
      n1.x = x.invert(n1.bbox.x - n1.bbox.offsetX);

      n2.bbox.x -= d * s;
      n2.x = x.invert(n2.bbox.x - n2.bbox.offsetX);

      // Y
      d = Math.min(4, Math.max(0.3 * (ry - ady), 1));
      if (dy < 0) d = -d;

      n1.bbox.y += d * (1 - s);
      n1.y = x.invert(n1.bbox.y - n1.bbox.offsetY);

      n2.bbox.y -= d * s;
      n2.y = x.invert(n2.bbox.y - n2.bbox.offsetY);

      d_sum += dsx;
      d_max = Math.max(d_max, dsx);
    }

    function find(name) {
      var pos = true;
      if (name[0] == '_') {
        name = name.splice(1);
        pos = false;
      }
      return _lodash.find(bboxes, function (n) {
        return n.label == name && n.tag.positive == pos;
      });
    }

    /*
     * node rendering
     */

    function Node() {
      var g = this.append('g').attr('class', 'node').style('opacity', 0.1).on('mousedown', mousedown).on('mouseup', mouseup).on('dblclick', dblclick);

      g.append('circle').attr('class', 'circle').attr('r', _config.cg.canvas.nodeRadius);

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
        return 'translate(7, 0) scale(' + _config.cg.canvas.nodeScale(d.scale) + ')';
      });
    }

    function computeBboxes() {
      d3nodes.each(nodeBBox);
    }

    var tight = false;
    function nodeBBox(node) {

      var bbox = (tight ? this.childNodes[1] : this).getBBox();
      // to achieve tight bbox reduce height by 4 on each side
      node.bbox = {
        x: x(node.x) + bbox.x,
        y: y(node.y) + bbox.y,
        w: bbox.width,
        h: bbox.height,
        offsetX: bbox.x,
        offsetY: bbox.y };
    }

    /*
     * edge rendering
     */

    var LineRenderer = {
      render: function render() {
        this.append('line').attr('class', 'link').style('stroke-width', function (d) {
          return _config.cg.canvas.edgeScale(d.value) + '1px';
        }).on('mouseover', highlightEdge).on('mouseout', unhighlightEdge).style('opacity', 0).transition().duration(_config.cg.canvas.duration).style('opacity', _config.cg.canvas.edgeOpacity);
      },

      update: function update(selection) {
        this.attr('x1', function (d) {
          return x(d.source.x);
        }).attr('y1', function (d) {
          return y(d.source.y);
        }).attr('x2', function (d) {
          return x(d.target.x);
        }).attr('y2', function (d) {
          return y(d.target.y);
        });

        //selection.each(function (d) {
        //  console.log('u:',d.value);
        //  var dx = d.target.x - d.source.x;
        //  var dy = d.target.y - d.source.y;
        //  var r = Math.sqrt(dx * dx + dy * dy);
        //  //var a = r> 0 ? opt.canvas.get('arrow.len') / r : 0;
        //  //var o1 = r > 0 ? opt.canvas.get('arrow.offset') / r : 0;
        //  var o1 = 0;
        //  var o2 = o1;
        //  var edge = d3.select(this);
        //
        //  edge
        //    .attr('x1', d.source.x + dx * o1)
        //    .attr('y1', d.source.y + dy * o1)
        //    .attr('x2', d.target.x - dx * o2)
        //    .attr('y2', d.target.y - dy * o2);
        //});
      }
    };

    var edgeRenderer = LineRenderer;

    function highlightEdge(d) {
      _d32['default'].select(this).classed('highlight', true).style('opacity', 1);
    }

    function unhighlightEdge(d) {
      _d32['default'].select(this).classed('highlight', false).style('opacity', _config.cg.canvas.edgeOpacity);
    }

    function updateForce() {
      force.charge(_config.cg.layout.charge).friction(_config.cg.layout.friction).gravity(_config.cg.layout.gravity).linkStrength(function (d) {
        return d.value * _config.cg.layout.linkStrength;
      }).linkDistance(function (d) {
        //return opt.layout.distScale(d.value);
        return 40;
      });
    }

    var zoom;

    function disableZoom() {
      svg.on('mousedown.zoom', null);
      svg.on('wheel.zoom', null);
    }
    function enableZoom() {
      svg.call(zoom);
    }

    function onZoom() {
      d3nodes.attr('transform', zoomTransform);
      d3links.call(edgeRenderer.update);
    }

    function zoomTransform(d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    }

    function addListeners() {
      var _this = this;

      ctrl.subscribe('relayout', function () {
        return relayout();
      });
      ctrl.subscribe('nudge', function () {
        return nudge();
      });

      ctrl.subscribe('redraw', function () {
        return render(_config.cg.canvas.fastDuration);
      });
      ctrl.subscribe('overlap', function () {
        computeBboxes();
        show(_config.cg.control.overlap);
      });

      ctrl.subscribe('layout', function () {
        updateForce();
        relayout();
        render(_config.cg.canvas.fastDuration);
      });

      _postal2['default'].subscribe({ channel: 'data', topic: 'changed', callback: function callback() {
          force.stop();
          var nodes = _data.tags.map(function (d) {
            return {
              id: d.id,
              label: d.concept.label,
              tag: d,
              items: d.items
            };
          });
          graph.update(nodes);

          // random initial pos instead of the default (0,0)
          _lodash.forEach(graph.nodes, function (node) {
            if (!node.hasOwnProperty('x')) {
              node.x = Math.random() * width;
              node.y = Math.random() * height;
            }
          });

          render(_config.cg.canvas.duration);
          relayout(_config.cg.layout.initIterations);
          return _this;
        } });
    }

    /*
     * API
     */

    var cg = {};

    cg.init = function (el) {
      width = _d32['default'].select(el).attr('width');
      height = _d32['default'].select(el).attr('height');
      svgContainer = _d32['default'].select(el).classed('cg', true).append('svg');
      svg = svgContainer.append('g');

      // transparent bg to catch pan/zoom mouse actions
      svg.append('rect').attr('class', 'overlay').attr('width', width).attr('height', height);

      svgLinks = svg.append('g').attr('class', 'links');
      svgNodes = svg.append('g').attr('class', 'nodes');

      force.on('tick', updatePosition).on('end', forceDone);

      addListeners();
      return this;
    };

    cg.resize = function (size) {
      force.stop();

      width = size[0];
      height = size[1];

      svgContainer.attr('width', width).attr('height', height);
      force.size([width, height]);

      x.domain([0, width]).range([0, width]);

      y.domain([0, height]).range([0, height]);

      zoom = _d32['default'].behavior.zoom().x(x).y(y).scaleExtent([0.5, 8]).on('zoom', onZoom);
      svg.call(zoom);

      svg.select('.overlay').attr('width', width).attr('height', height);

      if (graph) {
        relayout();
        render(_config.cg.canvas.fastDuration);
      }

      return this;
    };

    cg.selection = function (s) {
      selection = s;
      selection.on('changed.cg', selectionChanged);
    };

    return cg;
  };
});

//for (var i=1; i<t.length; i++) {
//  console.log(l[i], ':', t[i]-t[i-1], t[i]-t[0]);
//}

//.on('mouseover', mouseover)
//.on('mouseout', mouseout)

//# sourceMappingURL=cg.js.map