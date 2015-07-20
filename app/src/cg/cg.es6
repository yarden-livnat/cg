/**
 * Created by yarden on 12/17/14.
 */

import * as d3 from 'd3'
import * as postal from 'postal';

import * as data from 'services/data'
import {cg as opt} from 'config'
import * as Graph from './graph'


let ctrl = postal.channel('cg');

export default function() {
  let width, height,
    svgContainer, svg,
    svgNodes, svgLinks,
    force = d3.layout.force(),
    d3nodes, d3links,
    activeNodes, activeEdges,
    prevVisible = null,
    partialLayout = new Set(),
    selection,
    graph = Graph();

  let x = d3.scale.linear()
      .domain([0, 1])
      .range([0, 1]);

  let y = d3.scale.linear()
        .domain([0, 1])
        .range([0, 1]);

  /*
   * rendering
   */

    function visibleNodes() {
      return graph.nodes.filter(function(node) {
        return node.visible || node.excluded;
      });
    }

    function visibleEdges() {
      if (opt.canvas.showEdges == 'none') return [];

      var all = opt.canvas.showEdges == 'all';
      var range = opt.canvas.edgeValueSelection;
      return graph.edges.filter(function (edge) {
        return edge.source.visible && edge.target.visible
          && (all || selection.isAnySelected(edge.source.tag, edge.target.tag))
          && (edge.value >= range[0] && edge.value <= range[1]) ;
      });
    }

    function render(duration) {
      // mark visible nodes
      graph.nodes.forEach(function(node) {
          node.visible = node.items.length > 0 || node.excluded;
          if (node.excluded) {
            node.scale = node.lastScale;
          }
        }
      );

      activeNodes = visibleNodes();
      d3nodes = svgNodes.selectAll(".node")
        .data(activeNodes, function (d) { return d.id; });

      d3nodes.enter()
        .call(Node);

      d3nodes
        .transition()
          .duration(duration)
            .style('opacity', 1)
            .select('.scaledTag')
              .call(scaleNode)
            ;

      d3nodes.exit()
        .transition()
        .duration(duration)
        .style('opacity', 1e-6)
        .remove();

      // edges
      d3links = svgLinks.selectAll('.link')
        .data(visibleEdges(), function (d) { return d.id; });

      d3links.enter()
        .call(edgeRenderer.render);

      d3links
        .call(edgeRenderer.update);

      d3links.exit()
        .transition()
        .duration(duration)
        .style('opacity', 1e-6)
        .remove();
    }

    /*
     * Interactions
     */

    var drag = d3.behavior.drag()
      .origin(function (d) { return {x: d.x, y: d.y}; })
      .on('dragstart', onDragStart)
      .on('drag', onDrag)
      .on('dragend', onDragEnd);

    var offsetX, offsetY;

    function onDragStart(d, mx, my) {
      d.fixed |= 2;
      offsetX = d3.event.sourceEvent.layerX - x(d.x);
      offsetY = d3.event.sourceEvent.layerY - y(d.y);
    }


    function onDrag(d) {
      d3.select(this).classed("fixed", d.fixed |= 3);
      d.x = d.px = x.invert(d3.event.sourceEvent.layerX-offsetX);
      d.y = d.py = y.invert(d3.event.sourceEvent.layerY-offsetY);
      d3.select(this).attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      d3links.call(edgeRenderer.update);
    }

    function onDragEnd(d) {
      d.fixed &= ~6;
    }

    function dblclick(d) {
      d3.select(this).classed("fixed", d.fixed = false);
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
        if (d3.event.metaKey)       { d3.select(this).classed("fixed", d.fixed = false); }
        else if (d3.event.shiftKey) { excludeNode.call(this, d); }
        else                        { selectNode.call(this, d); }
      }
    }

    function mouseover(d) {
      d3.select(this.parentNode).select('text')
        .transition()
        .duration(opt.canvas.duration)
        .attr('transform', 'translate(7, 0) scale(1)');
    }

    function mouseout(d) {
      d3.select(this.parentNode).select('text')
        .transition()
        .duration(opt.canvas.duration)
        .call(scaleNode);
    }

    /*
     * Selection
     */
    function selectNode(d) {
      force.stop();

      d.selected = !d.selected;
      d3.select(this).classed('selected', d.selected);

      if (!d.selected  && partialLayout.delete(d.tag)) {
        prevVisible = _.filter(graph.nodes, function(node) { return node.visible; });
      } else {
        prevVisible = null;
      }

      if (d.selected && d.excluded) {
        d.excluded = false;
        d3.select(this).classed('excluded', false);
      }
      d3.select(this).select('.frame')
        .transition()
        .duration(opt.canvas.duration)
        .style('opacity', d.selected ? 1 : 0);

      selection.select(d.tag,  d.selected);
    }

    function excludeNode(d) {
      force.stop();

      d.excluded = !d.excluded;
      d3.select(this).classed('excluded', d.excluded);

      if (d.excluded && d.selected) {
        d.selected = false;
        d3.select(this).classed('selected', false);
      }
      if (d.excluded) {
        d.lastScale = d.scale;
      }

      d3.select(this).select('.frame')
        .transition()
        .duration(opt.canvas.duration)
        .style('opacity', d.excluded ? 1 : 0);

      selection.exclude(d.tag,  d.excluded);
    }

    function selectionChanged() {
      if (graph == undefined) return;

      graph.domain = selection.domain;
      if (prevVisible) {
        adjustLayout();
        prevVisible = null;
      }
      render(opt.canvas.duration);
    }


    /*
     * layout
     */

    var exec_forceDone = false;
    var clock = (function () {
      var t = [];
      var l = [];

      function clock() {
      };

      clock.start = function() {
        t = [Date.now()]; l = ['start'];
      };

      clock.mark = function(label) {
        t.push(Date.now());
        l.push(label);
      };

      clock.print = function() {
        for (var i=1; i<t.length; i++) {
          console.log(l[i], ':', t[i]-t[i-1], t[i]-t[0]);
        }
      };
      return clock;
    })();


    function relayout(iter) {
      selection.tags().forEach(function(tag) {
        partialLayout.add(tag); });

      iter = iter || 0;

      activeNodes = graph.nodes.filter(function (node) { return node.visible; });
      activeEdges = graph.edges;

      if (opt.layout.onlyVisibleEdges) {
        var edgeStrength = opt.canvas.edgeStrength;
        activeEdges = activeEdges.filter(function (edge) {
          return edge.source.visible && edge.target.visible
            //&& edge.value > edgeStrength
            ;
        });
      }

      exec_forceDone = true;
      clock.start();
      force
        .nodes(activeNodes)
        .links(activeEdges)
        .on('tick', null)
        .on('end', forceDone)
        .start();

      // reduce visible cloud movements
      clock.mark('loop');
      for (var i = 0; i < iter; ++i)
          force.tick();

      clock.mark('update');
      force.on('tick', updatePosition);
      clock.mark('after update');
    }

    function forceDone() {
      //console.log('force done ', exec_forceDone);
      if (!exec_forceDone) return;

      exec_forceDone = false;

      if (opt.layout.nudge) {
        nudge();
      }
      clock.mark('force done');
      clock.print();

      _.forEach(graph.nodes, function(n) { n.px = x; n.py = y;});
    }

    function adjustLayout() {
      console.log('adjust layout');
      var notFixed = _.filter(prevVisible, function (node) { return !(node.fixed & 1); });
      _.forEach(notFixed, function(node) { node.fixed |= 1; });


      graph.nodes.forEach(function(node) {
          node.visible = node.items.length > 0 || node.excluded;
          if (node.excluded) {
            node.scale = node.lastScale;
          }
        }
      );

      var nodes = _.filter(graph.nodes, function(node) { return node.visible; });
      var edges = _.filter(graph.edges, function(edge) {
        return edge.source.visible && edge.target.visible;
      });

      force
        .nodes(nodes)
        .links(edges)
        .on('tick', null)
        .on('end', null)
        .start();

      for (var i=0; i<250; i++) force.tick();

      force.stop();

      _.forEach(notFixed, function(node) { node.fixed &= ~1;});
      _.forEach(graph.nodes, function(n) { n.px = x; n.py = y;});
      updatePosition();
    }

    function clamp(v, min, max) {
      return  v < min ? min : (v> max ? max : v);
    }

    function updatePosition() {
      //nudge_once();
      //console.log('update pos');

      if (opt.layout.clampToWindow) {
        _.forEach(activeNodes, function (node) {
          node.x = clamp(node.x,  0, width - node.w);
          node.y = clamp(node.y,  0, height - node.h);
        });
      }

      // x(), y() to account for zoom
      d3nodes.attr('transform', function (d) {
        //if (d.label == 'Cough' && d.tag.positive) console.log('cough: ',x(d.x), y(d.y));
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });
      d3links.call(edgeRenderer.update);

      // early termination
      var max = 0, sum = 0, zero = 0, one=0;
      _.each(activeNodes, function(node) {
        var dx = Math.abs(node.x -node.px);
        var dy = Math.abs(node.y - node.py);
        var speed = Math.sqrt(dx*dx + dy+dy);
        max = Math.max(speed,  max);
        sum += speed;
        if (speed == 0) zero++;
        if (speed < 1) one++;
      });

      //var max = _.reduce(activeNodes,  function(max, node) {
      //  return Math.max(max,  Math.abs(node.x - node.px));
      //}, 0);

      //console.log('speed  n:',activeNodes.length,' max:', max,  ' avg:',sum/activeNodes.length, 'zero:', zero,  '<1:', one);
      if (max < opt.layout.minSpeed) {
        force.stop();
      }
    }


    function label(node) {
      return node.tag.positive ? node.label : node.label+'_N';
    }

    function intersect(b1, b2) {
      // note: top and bottom are reversed (y points down)
      return !(b1.x+b1.w < b2.x || b2.x+b2.w < b1.x || b1.y +b1.h < b2.y || b2.y+b2.h< b1.y);
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
              if (data.indexOf(bboxes[i]) == -1)
                data.push(bboxes[i]);
            }
          }
        }
      }
      var o = svg.selectAll('.check')
        .data(data,  function(d) {return d.id});

      o.enter()
        .append('rect')
        .attr('class', 'check')
        .attr('width', function(d) { return d.bbox.w; })
        .attr('height', function(d) { return d.bbox.h});


      o.attr('transform', function(d) { return 'translate('+ d.bbox.x + ',' + d.bbox.y + ')';});

      o.exit().remove();
    }

    function nudge() {
      computeBboxes();
      show(opt['control'].overlap);
      d3.timer(function() {
        var r = nudge_step();
        updatePosition();
        return r;
      });
    }

    function nudge_once() {
      if (opt.layout.nudge) {
        computeBboxes();
        nudge_step();
      }
    }

    function nudge_step() {
      bboxes = activeNodes;
      var n = bboxes.length;
      var i, c = 0;

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
      show(!done && opt['control'].overlap);

      return done;
    }

    function repel(n1, n2) {

      var dx = (n1.bbox.x + n1.bbox.w/2)- (n2.bbox.x + n2.bbox.w/2);
      var dy = (n1.bbox.y + n1.bbox.h/2)- (n2.bbox.y + n2.bbox.h/2);

      var rx = (n1.bbox.w + n2.bbox.w)/2;
      var ry = (n1.bbox.h + n2.bbox.h)/2;

      var adx = Math.abs(dx);
      var ady = Math.abs(dy);

      var s = n1.scale/(n1.scale + n2.scale);

      // X
      var d= Math.min( 4, Math.max(0.3*(rx - adx), 1));
      if (dx < 0) d = -d;

      var dsx = d*(1-s);
      n1.bbox.x += dsx;
      n1.x = x.invert(n1.bbox.x-n1.bbox.offsetX);

      n2.bbox.x -= d*s;
      n2.x = x.invert(n2.bbox.x-n2.bbox.offsetX);

      // Y
      d= Math.min(4, Math.max(0.3*(ry - ady), 1));
      if (dy < 0) d = -d;

      n1.bbox.y += d*(1-s);
      n1.y = x.invert(n1.bbox.y-n1.bbox.offsetY);

      n2.bbox.y -= d*s;
      n2.y = x.invert(n2.bbox.y-n2.bbox.offsetY);

      d_sum += dsx;
      d_max = Math.max(d_max,  dsx);
    }

    function find(name) {
      var pos = true;
      if (name[0] == '_') {
        name = name.splice(1);
        pos = false;
      }
      return _.find(bboxes,  function(n) { return n.label == name && n.tag.positive == pos; });
    }

    /*
     * node rendering
     */

    function Node() {
      var g = this.append('g')
            .attr('class', 'node')
            .style('opacity', 0.1)
            .on('mousedown', mousedown)
            .on('mouseup', mouseup)
            .on("dblclick", dblclick)
        ;

      g.append('circle')
        .attr('class', 'circle')
        .attr('r', opt.canvas.nodeRadius)
        //.on('mouseover', mouseover)
        //.on('mouseout', mouseout)
      ;

      var tag = g.append('g')
        .attr('class', 'tag');

      var scaled = tag.append('g')
        .attr('class', 'scaledTag');

      var frame = scaled.append('g')
            .classed('frame', true)
            .style('opacity', 0)
            //.attr('visibility', 'hidden')
        ;

      frame.append('rect')
        .classed('border', true);

      frame.append('rect')
        .classed('bg', true);

      scaled.append('text')
        .attr('class', 'tag')
        .attr('stroke', function (d) { return d.color; })
        .attr('fill', function (d) { return d.color; })
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .text(function (d) {return d.label; });

      scaled.each(function(d) {
        var text = this.childNodes[1]
        var bbox = text.getBBox();

        d.w = bbox.width;
        d.h = bbox.height;

        d3.select(this).select('.bg')
          .attr('width', bbox.width-2)
          .attr('height', bbox.height-2)
          .attr('x', bbox.x+1)
          .attr('y', bbox.y+1);

        d3.select(this).select('.border')
          .attr('width', bbox.width)
          .attr('height', bbox.height)
          .attr('y', bbox.y);

      });

      scaled.call(scaleNode);

      g.attr('transform', function (d) { return 'translate(' + x(d.x) + ',' + y(d.y) + ')'; });
      g.call(drag);

    }

    function scaleNode(node) {
      node.attr('transform', function (d) {
          return 'translate(7, 0) scale(' + opt.canvas.nodeScale(d.scale) + ')';
        }
      );
    }

    function computeBboxes() {
      d3nodes.each(nodeBBox);
    }

    var tight = false;
    function nodeBBox(node) {

      var bbox= (tight? this.childNodes[1] : this).getBBox();
      // to achieve tight bbox reduce height by 4 on each side
      node.bbox = {
        x: x(node.x)+bbox.x,
        y: y(node.y)+bbox.y,
        w: bbox.width,
        h: bbox.height,
        offsetX: bbox.x,
        offsetY: bbox.y}
      ;
    }

    /*
     * edge rendering
     */

    var LineRenderer = {
      render: function() {
        this.append('line')
          .attr('class', 'link')
          .style('stroke-width', function (d) {
            return opt.canvas.edgeScale(d.value) + '1px'; })
          .on('mouseover', highlightEdge)
          .on('mouseout', unhighlightEdge)
          .style('opacity', 0)
          .transition()
            .duration(opt.canvas.duration)
            .style('opacity', opt.canvas.edgeOpacity)
        ;
      },

      update: function(selection) {
        this
          .attr('x1', function(d) { return x(d.source.x); })
          .attr('y1', function(d) { return y(d.source.y); })
          .attr('x2', function(d) { return x(d.target.x); })
          .attr('y2', function(d) { return y(d.target.y); });

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
      d3.select(this)
        .classed('highlight', true)
        .style('opacity', 1);
    }

    function unhighlightEdge(d) {
      d3.select(this)
        .classed('highlight', false)
        .style('opacity', opt.canvas.edgeOpacity);
    }

    function updateForce() {
      force
        .charge(opt.layout.charge)
        .friction(opt.layout.friction)
        .gravity(opt.layout.gravity)
        .linkStrength(function (d) {
          return d.value * opt.layout.linkStrength;
        })
        .linkDistance(function (d) {
          //return opt.layout.distScale(d.value);
          return 40;
        })
      ;
    }


    var zoom;

    function disableZoom() {
      svg.on('mousedown.zoom', null);
      svg.on('wheel.zoom', null);
    }
    function enableZoom() { svg.call(zoom); }

    function onZoom() {
      d3nodes.attr('transform', zoomTransform);
      d3links.call(edgeRenderer.update)
    }

    function zoomTransform(d) {
      return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
    }

  function addListeners() {
   ctrl.subscribe('relayout', () => relayout());
   ctrl.subscribe('nudge', () => nudge());

   ctrl.subscribe('redraw', () =>  render(opt.canvas.fastDuration));
   ctrl.subscribe('overlap', () =>  {
      computeBboxes();
      show(opt.control.overlap);
    });

   ctrl.subscribe('layout', () => {
      updateForce();
      relayout();
      render(opt.canvas.fastDuration);
    });

    postal.subscribe({channel: 'data', topic: 'changed', callback: () => {
      force.stop();
      let nodes = data.tags.map(function(d) {
        return {
          id: d.id,
          label: d.concept.name,
          tag: d,
          items: d.items
        };
      });
      graph.update(nodes);

      // random initial pos instead of the default (0,0)
      _.forEach(graph.nodes, function (node) {
          if (!node.hasOwnProperty('x')) {
            node.x = Math.random() * width;
            node.y = Math.random() * height;
          }
        }
      );

      render(opt.canvas.duration);
      relayout(opt.layout.initIterations);
      return this;
    }});
  }

  /*
   * API
   */

  let cg = {};

  cg.init = function(el) {
    width = d3.select(el).attr('width');
    height = d3.select(el).attr('height');
    svgContainer = d3.select(el)
      .classed("cg", true)
      .append("svg");
    svg = svgContainer.append("g");

    // transparent bg to catch pan/zoom mouse actions
    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height);

    svgLinks = svg.append("g").attr("class", "links");
    svgNodes = svg.append("g").attr("class", "nodes");

    force
      .on('tick', updatePosition)
      .on('end', forceDone);

    addListeners();
    return this;
  };

  cg.resize = function(w, h) {
    console.log('cg resize: '+w,+'x'+h);
    force.stop();

    width = w;
    height = h;

    svgContainer.attr("width", w).attr("height", h);
    force.size([w, h]);

    x.domain([0, width]).range([0, width]);

    y.domain([0, height]).range([0, height]);

    zoom = d3.behavior.zoom().x(x).y(y).scaleExtent([.5, 8]).on("zoom", onZoom);
    svg.call(zoom);

    svg.select('.overlay')
      .attr('width', width)
      .attr('height', height);

    if (graph) {
      relayout();
      render(opt.canvas.fastDuration);
    }

    return this;
  };

  cg.selection = function(s) {
    selection = s;
    selection.on('changed', selectionChanged);
  };

  return cg;
}
