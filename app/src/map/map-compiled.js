define(['exports', 'module', 'config', 'd3', 'leaflet'], function (exports, module, _config, _d3, _leaflet) {
  /**
   * Created by yarden on 7/3/15.
   */

  'use strict';

  module.exports = function (el, opt) {
    // options = Object.assign({}, MAP_DEFAULTS, opt);
    var options = _config.MAP_DEFAULTS;
    var map = new _leaflet.Map(el).addLayer(_leaflet.tileLayer(options.mapbox.url, options.mapbox.opt)).setView(options.center, options.zoom);

    var svgContainer = _d3.select(map.getPanes().overlayPane).append('svg').attr('width', 200).attr('height', 200);

    var svg = svgContainer.append('g').attr('class', 'leaflet-zoom-hide');

    initLeaflet();

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new _leaflet.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    function initLeaflet() {
      var transform = _d3.geo.transform({ point: projectPoint }),
          path = _d3.geo.path().projection(transform);

      _d3.json(options.zipcodes_file, function (error, collection) {
        if (error) {
          // Todo: better error handling
          console.error(error);
          return;
        }

        var feature = svg.selectAll('path').data(collection.features).enter().append('path');

        map.on('viewreset', reset);
        reset();

        function reset() {
          var bounds = path.bounds(collection),
              topLeft = bounds[0],
              bottomRight = bounds[1];

          svgContainer.attr('width', bottomRight[0] - topLeft[0]).attr('height', bottomRight[1] - topLeft[1]).style('left', topLeft[0] + 'px').style('top', topLeft[1] + 'px');

          svg.attr('transform', 'translate(' + -topLeft[0] + ',' + -topLeft[1] + ')');

          feature.attr('d', path);
        }
      });
    }

    var Map = {};

    //Map.resize = function(w, h) {
    //  width = w;
    //  height = h;
    //
    //  svgContainer.attr("width", w).attr("height", h);
    //
    //  return this;
    //};

    return Map;
  };
});

//# sourceMappingURL=map-compiled.js.map