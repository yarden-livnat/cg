/**
 * Created by yarden on 7/3/15.
 */

import {MAP_DEFAULTS} from 'config';
import * as d3 from 'd3';
import * as L from 'leaflet';

export default function (el, opt) {
  // options = Object.assign({}, MAP_DEFAULTS, opt);
  let options = MAP_DEFAULTS;
  let map = new L.Map(el)
    .addLayer(L.tileLayer(options.mapbox.url, options.mapbox.opt))
    .setView(options.center, options.zoom);

  let svgContainer = d3.select(map.getPanes().overlayPane)
    .append("svg")
    .attr('width', 200)
    .attr('height', 200);

  let svg = svgContainer.append("g")
    .attr("class", "leaflet-zoom-hide");

  initLeaflet();

  function projectPoint(x, y) {
    let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function initLeaflet() {
    let transform = d3.geo.transform({point: projectPoint}),
        path = d3.geo.path().projection(transform);

    d3.json(options.zipcodes_file, (error, collection) => {
      if (error) {
        // Todo: better error handling
        console.error(error);
        return;
      }

      let feature = svg.selectAll("path")
        .data(collection.features)
        .enter().append("path");

      map.on("viewreset", reset);
      reset();

      function reset() {
        let bounds = path.bounds(collection),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svgContainer.attr("width", bottomRight[0] - topLeft[0] )
          .attr("height", bottomRight[1] - topLeft[1])
          .style("left", topLeft[0] + "px")
          .style("top", topLeft[1] + "px");

        svg.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        feature.attr("d", path);
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
}
