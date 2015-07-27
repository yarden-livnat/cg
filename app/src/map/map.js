define(['exports', 'module', 'config', 'd3', 'leaflet'], function (exports, module, _config, _d3, _leaflet) {
  /**
   * Created by yarden on 7/3/15.
   */

  'use strict';

  module.exports = function (el, opt) {

    var AREA_ALPHA = 0.6;
    var POPULATION_FACTOR = 1000;
    var DURATION = 500;

    var colorScale = _d3.interpolateLab('#fff', '#f00');
    var width = undefined,
        height = undefined;
    var population = new Map();
    var selection = undefined;
    var zipcodes = new Map();
    var active = new Map();
    var svg = undefined,
        svgContainer = undefined;

    // options = Object.assign({}, MAP_DEFAULTS, opt);
    var options = _config.MAP_DEFAULTS;
    var map = new _leaflet.Map(el).addLayer(_leaflet.tileLayer(options.mapbox.url, options.mapbox.opt)).setView(options.center, options.zoom);

    var transform = _d3.geo.transform({ point: projectPoint });
    var path = _d3.geo.path().projection(transform);

    /* Initialize the SVG layer */
    map._initPathRoot();

    svgContainer = _d3.select('#map').select('svg');
    svg = svgContainer.append('g');

    function init() {
      _d3.json(options.zipcodes_file, function (error, collection) {
        if (error) {
          // Todo: better error handling
          console.error(error);
          return;
        }

        collection.features.forEach(function (d) {
          zipcodes.set(d.properties.Zip_Code, d);
          //d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);
        });

        var feature = svg.selectAll('path').data(collection.features, function (d) {
          return d.properties.Zip_Code;
        }).enter().append('path');

        function update() {
          feature.attr('d', path);
        }

        map.on('viewreset', update);
        update();
      });
    }

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new _leaflet.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    function assignColor(zipcode, n) {
      var f = n * POPULATION_FACTOR / population.get(zipcode);
      console.log('zipcode: ' + zipcode + ' factor: ' + n + '/' + population.get(zipcode) + ' -> ' + f);
      if (f > 1) f = 1;
      return colorScale(f);
    }

    function selectionChanged() {
      var current = new Map();
      selection.domain.forEach(function (enc) {
        if (population.has(enc.zipcode)) {
          var count = current.get(enc.zipcode) || 0;
          current.set(enc.zipcode, count + 1);
        }
      });

      console.log(current);

      var update = [];
      current.forEach(function (n, zipcode) {
        var feature = zipcodes.get(zipcode);
        if (feature) {
          feature.alpha = AREA_ALPHA;
          feature.color = assignColor(zipcode, n);
          update.push(feature);
        }
      });
      active.forEach(function (n, zipcode) {
        if (!current.has(zipcode)) {
          var feature = zipcodes.get(zipcode);
          feature.color = '#fff';
          feature.alpha = 0;
          update.push(feature);
        }
      });

      var s = svg.selectAll('path').data(update, function (d) {
        return d.properties.Zip_Code;
      }).transition().duration(DURATION).style('fill-opacity', function (d) {
        return d.alpha;
      }).style('fill', function (d) {
        return d.color;
      }).style('stroke', function (d) {
        return d.alpha > 0 ? '#333' : '#ccc';
      }).style('stroke-width', function (d) {
        return d.alpha > 0 ? '1px' : 0;
      });

      active = current;
    }

    var api = {};

    api.init = function () {
      init();
    };

    api.population = function (map) {
      population = map;
      return this;
    };

    api.selection = function (s) {
      selection = s;
      selection.on('changed.map', selectionChanged);
      return this;
    };

    api.resize = function (w, h) {
      width = w;
      height = h;
      svgContainer.attr('width', w).attr('height', h);
      return this;
    };

    return api;
  };
});

//# sourceMappingURL=map.js.map