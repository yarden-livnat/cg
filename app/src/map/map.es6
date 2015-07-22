/**
 * Created by yarden on 7/3/15.
 */

import {MAP_DEFAULTS} from 'config';
import * as d3 from 'd3';
import * as L from 'leaflet';

export default function (el, opt) {

  const AREA_ALPHA = 0.6;
  const POPULATION_FACTOR = 1000;
  const DURATION = 500;

  let colorScale = d3.interpolateLab('#fff', '#f00');
  let width, height;
  let population = new Map();
  let selection;
  let zipcodes = new Map();
  let active = new Map();
  let svg, svgContainer;

  // options = Object.assign({}, MAP_DEFAULTS, opt);
  let options = MAP_DEFAULTS;
  let map = new L.Map(el)
    .addLayer(L.tileLayer(options.mapbox.url, options.mapbox.opt))
    .setView(options.center, options.zoom);

  let transform = d3.geo.transform({point: projectPoint});
  let path = d3.geo.path().projection(transform);

  /* Initialize the SVG layer */
  map._initPathRoot();

  svgContainer = d3.select('#map').select('svg');
  svg = svgContainer.append('g');


  function init() {
    d3.json(options.zipcodes_file, (error, collection) => {
      if (error) {
        // Todo: better error handling
        console.error(error);
        return;
      }

      collection.features.forEach(d => {
        zipcodes.set(d.properties.Zip_Code, d);
        //d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);
      });

      let feature = svg.selectAll("path")
        .data(collection.features, function(d) { return d.properties.Zip_Code;})
        .enter().append("path");

      function update() {
        feature.attr("d", path);
      }

      map.on('viewreset', update);
      update();
    });
  }

  function projectPoint(x, y) {
    let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function assignColor(zipcode, n) {
    let f =  n * POPULATION_FACTOR/population.get(zipcode);
    console.log('zipcode: '+zipcode+' factor: '+n+'/'+population.get(zipcode)+' -> '+f);
    if (f > 1) f = 1;
    return colorScale(f);
  }

  function selectionChanged() {
    let current = new Map();
    selection.domain.forEach(enc => {
      if (population.has(enc.zipcode)) {
        let count = current.get(enc.zipcode) || 0;
        current.set(enc.zipcode, count+1);
      }
    });

    console.log(current);

    let update = [];
    current.forEach((n, zipcode) => {
      let feature = zipcodes.get(zipcode);
      if (feature) {
        feature.alpha = AREA_ALPHA;
        feature.color = assignColor(zipcode, n);
        update.push(feature);
      }
    });
    active.forEach((n, zipcode) => {
      if (!current.has(zipcode)) {
        let feature = zipcodes.get(zipcode);
        feature.color = '#fff';
        feature.alpha = 0;
        update.push(feature);
      }
    });

    let s = svg.selectAll('path')
      .data(update, function(d) {return d.properties.Zip_Code;})
      .transition()
        .duration(DURATION)
        .style('fill-opacity', function(d) { return d.alpha})
        .style('fill', function(d) { return d.color})
        .style('stroke', function(d) { return d.alpha > 0 ? '#333' : '#ccc'; })
        .style('stroke-width', function(d) { return d.alpha > 0 ? '1px' : 0;});

    active = current;
  }

  var api = {};

  api.init = function() { init(); };

  api.population = function(map) {
    population = map;
    return this;
  };

  api.selection = function(s) {
    selection = s;
    selection.on('changed.map', selectionChanged);
    return this;
  };

  api.resize = function(w, h) {
    width = w;
    height = h;
    svgContainer.attr("width", w).attr("height", h);
    return this;
  };

  return api;
}
