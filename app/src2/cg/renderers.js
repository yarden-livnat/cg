define(['exports'], function (exports) {
  /**
   * Created by yarden on 8/25/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.NodeRenderer = NodeRenderer;
  exports.EdgeRenderer = EdgeRenderer;

  function NodeRenderer() {
    var scaleFunc = undefined;
    var radius = undefined;
    var x = undefined,
        y = undefined;

    function render(selection) {
      var g = selection.append('g').attr('class', 'node').style('opacity', 0.1)
      //.on('mousedown', mousedown)
      //.on('mouseup', mouseup)
      //.on("dblclick", dblclick)
      ;

      g.append('circle').attr('class', 'circle').attr('r', radius);

      //let tag = g.append('g');
      //  //.attr('class', 'tag');

      var scaled = g.append('g').attr('class', 'scaledTag').attr('transform', 'translate(7, 0) scale(0.1)');

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

        d3.select(this).select('.bg').attr('width', bbox.width - 2).attr('height', bbox.height - 2).attr('x', bbox.x + 1).attr('y', bbox.y + 1);

        d3.select(this).select('.border').attr('width', bbox.width).attr('height', bbox.height).attr('y', bbox.y);
      });

      return g;
    }

    render.scale = function (selection) {
      selection.select('.scaledTag').attr('transform', function (d) {
        return 'translate(7, 0) scale(' + scaleFunc(d.scale) + ')';
      });
    };

    render.scaleFunc = function (_) {
      if (!arguments.length) return scaleFunc;
      scaleFunc = _;
      return this;
    };

    render.radius = function (_) {
      if (!arguments.length) return radius;
      radius = _;
      return this;
    };

    render.x = function (_) {
      if (!arguments.length) return x;
      x = _;
      return this;
    };

    render.y = function (_) {
      if (!arguments.length) return y;
      y = _;
      return this;
    };

    return render;
  }

  function EdgeRenderer() {
    var scale = function scale(d) {
      return d;
    };
    var opacity = 0.5;
    var duration = 0;
    var x = function x(d) {
      return d;
    };
    var y = function y(d) {
      return d;
    };

    function renderer(selection) {
      selection.append('line').attr('class', 'link').style('stroke-width', '0.5px') //function (d) { return scale(d.value) + '1px'; })
      .style('stroke', d3.hsl(0, 1, 1))
      //.on('mouseover', highlightEdge)
      //.on('mouseout', unhighlightEdge)
      .style('opacity', 0)
      //.each( function(d)  { console.log('edge:',d, ' value:', d.value, scale(d.value), d3.hsl(0, 0.8, scale(d.value)))})
      .transition().duration(duration).style('opacity', opacity)
      //.style('stroke', function(d) { return d3.hsl(0, 80, scale(d.value)); })
      .styleTween('stroke', function (d, a) {
        return d3.interpolateHsl(d3.hsl(0, 1, 1), d3.hsl(0, 0.8, scale(d.value)));
      });
    }

    renderer.update = function (selection) {
      this.attr('x1', function (d) {
        return x(d.source.x);
      }).attr('y1', function (d) {
        return y(d.source.y);
      }).attr('x2', function (d) {
        return x(d.target.x);
      }).attr('y2', function (d) {
        return y(d.target.y);
      });
    };

    renderer.scale = function (_) {
      if (!arguments.length) return scale;
      scale = _;
      return this;
    };

    renderer.opacity = function (_) {
      if (!arguments.length) return opacity;
      opacity = _;
      return this;
    };

    renderer.duration = function (_) {
      if (!arguments.length) return duration;
      duration = _;
      return this;
    };

    renderer.x = function (_) {
      if (!arguments.length) return x;
      x = _;
      return this;
    };

    renderer.y = function (_) {
      if (!arguments.length) return y;
      y = _;
      return this;
    };

    return renderer;
  }
});

//.on('mouseover', mouseover)
//.on('mouseout', mouseout)

//# sourceMappingURL=renderers.js.map