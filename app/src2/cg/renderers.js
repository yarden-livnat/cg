define(['exports'], function (exports) {
  /**
   * Created by yarden on 8/25/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.NodeRenderer = NodeRenderer;

  function NodeRenderer() {
    var scaleFunc = undefined;
    var radius = undefined;

    function render() {
      var g = this.append('g').attr('class', 'node').style('opacity', 0.1)
      //.on('mousedown', mousedown)
      //.on('mouseup', mouseup)
      //.on("dblclick", dblclick)
      ;

      g.append('circle').attr('class', 'circle').attr('r', radius);

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

        d3.select(this).select('.bg').attr('width', bbox.width - 2).attr('height', bbox.height - 2).attr('x', bbox.x + 1).attr('y', bbox.y + 1);

        d3.select(this).select('.border').attr('width', bbox.width).attr('height', bbox.height).attr('y', bbox.y);
      });

      scaled.call(render.scale);

      g.attr('transform', function (d) {
        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
      });
      g.call(drag);

      return this;
    }

    render.scale = function (node) {
      node.attr('transform', function (d) {
        return 'translate(7, 0) scale(' + scaleFunc(d.scale) + ')';
      });
      return this;
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

    return render;
  }
});

//.on('mouseover', mouseover)
//.on('mouseout', mouseout)

//# sourceMappingURL=renderers.js.map