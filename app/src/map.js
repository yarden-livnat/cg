define(['exports', 'module', 'd3', 'leaflet', 'postal', './config'], function (exports, module, _d3, _leaflet, _postal, _config) {
  /**
   * Created by yarden on 7/3/15.
   */

  'use strict';

  module.exports = function (opt) {

    var AREA_ALPHA = 0.6;
    var POPULATION_FACTOR = 1000;
    var DURATION = 500;

    var BOUNDARY_HIGHLIGHT_WIDTH = '1.5px';
    var BOUNDARY_ACTIVE_WIDTH = '0.5px';
    var BOUNDARY_NON_ACTIVE_WIDTH = '0';

    var BOUNDARY_SELECTED_COLOR = 'blue';
    var BOUNDARY_ACTIVE_COLOR = '#333';
    var BOUNDARY_NON_ACTIVE_COLOR = '#333';

    var format = _d3.format('4.2f');

    var colorScale = _d3.interpolateLab('#fff', '#f00');
    var width = undefined,
        height = undefined;
    var population = new Map();
    var selection = undefined;
    var zipcodes = new Map();
    var active = new Map();
    var current = new Map();
    var svg = undefined,
        svgContainer = undefined;
    var selectedZipcodes = [];

    var options = Object.assign({}, _config.MAP_DEFAULTS, opt);
    //let options = MAP_DEFAULTS;
    var map = new _leaflet.Map('map').addLayer(_leaflet.tileLayer(options.mapbox.url, options.mapbox.opt)).setView(options.center, options.zoom);

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
          d.state = { n: 0, boundary_color: BOUNDARY_NON_ACTIVE_COLOR, boundary_width: BOUNDARY_NON_ACTIVE_WIDTH };
        });

        var feature = svg.selectAll('path').data(collection.features, function (d) {
          return d.properties.Zip_Code;
        }).enter().append('path').on('mouseenter', function (d) {
          showInfo(d.properties.Zip_Code, true);
        }).on('mouseout', function (d) {
          showInfo(d.properties.Zip_Code, false);
        }).on('click', function (d) {
          selectZipcode(d.properties.Zip_Code, _d3.event.metaKey);
        });

        function update() {
          feature.attr('d', path);
        }

        map.on('viewreset', update);
        update();
      });
    }

    function showInfo(zipcode, show) {
      var cases = current.get(zipcode);
      if (show && cases) {
        var rate = format(cases * POPULATION_FACTOR / population.get(zipcode));
        _d3.select('#map-info').text('Zipcode: ' + zipcode + ' cases:' + cases + '  rate:' + rate);
      } else {
        _d3.select('#map-info').text('');
      }

      var feature = zipcodes.get(zipcode);
      feature.state.highlight = show;
      feature.state.boundary_width = show && cases ? BOUNDARY_HIGHLIGHT_WIDTH : cases ? BOUNDARY_ACTIVE_WIDTH : BOUNDARY_NON_ACTIVE_WIDTH;

      svg.selectAll('path').filter(function (d) {
        return d.properties.Zip_Code == zipcode;
      }).style('stroke-width', feature.state.boundary_width);
    }

    function selectZipcode(zipcode, append) {
      _d3.event.preventDefault();
      var update = [];
      if (!append) {
        if (selectedZipcodes.length == 1 && selectedZipcodes[0] == zipcode) {
          select(zipcode, false);
          update = [zipcode];
          selectedZipcodes = [];
        } else {
          select(selectedZipcodes, false);
          select(zipcode, true);
          update = selectedZipcodes;
          selectedZipcodes = [zipcode];
          if (update.indexOf(zipcode) == -1) update.push(zipcode);
        }
      } else {
        var i = selectedZipcodes.indexOf(zipcode);
        if (i == -1) {
          select(zipcode, true);
          selectedZipcodes.push(zipcode);
        } else {
          select(zipcode, false);
          selectedZipcodes.splice(i, 1);
        }
        update = [zipcode];
      }

      console.log('selected: ' + selectedZipcodes);
      svg.selectAll('path').filter(function (d) {
        return update.indexOf(d.properties.Zip_Code) != -1;
      }).each(function (d) {
        console.log(d + ': ' + d.state.boundary_color);
      }).style('stroke', function (d) {
        return d.state.boundary_color;
      });

      //postal.publish({channel: ''});
    }

    function select(zipcode, on) {
      if (!zipcode) return;
      var list = zipcode instanceof Array && zipcode || [zipcode];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var z = _step.value;

          var feature = zipcodes.get(z);
          feature.state.selected = on;
          feature.state.boundary_color = on ? BOUNDARY_SELECTED_COLOR : feature.n > 0 ? BOUNDARY_ACTIVE_COLOR : BOUNDARY_NON_ACTIVE_COLOR;
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
    }

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new _leaflet.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    function assignColor(zipcode, n) {
      var f = Math.min(n * POPULATION_FACTOR / population.get(zipcode), 1);
      return colorScale(f);
    }

    function selectionChanged() {
      current = new Map();
      selection.domain.forEach(function (enc) {
        if (population.has(enc.zipcode)) {
          var count = current.get(enc.zipcode) || 0;
          current.set(enc.zipcode, count + 1);
        }
      });

      var update = [];
      current.forEach(function (n, zipcode) {
        var feature = zipcodes.get(zipcode);
        if (feature) {
          feature.state.alpha = AREA_ALPHA;
          feature.state.color = assignColor(zipcode, n);
          feature.state.active = true;
          feature.state.boundary_width = BOUNDARY_ACTIVE_WIDTH;
          feature.state.boundary_color = feature.state.selected ? BOUNDARY_SELECTED_COLOR : BOUNDARY_ACTIVE_COLOR;
          update.push(feature);
        }
      });
      active.forEach(function (n, zipcode) {
        if (!current.has(zipcode)) {
          var feature = zipcodes.get(zipcode);
          feature.state.color = '#fff';
          feature.state.alpha = 0;
          feature.state.active = false;
          feature.state.boundary_width = BOUNDARY_NON_ACTIVE_WIDTH;
          update.push(feature);
        }
      });

      var s = svg.selectAll('path').data(update, function (d) {
        return d.properties.Zip_Code;
      }).transition().duration(DURATION).style('fill-opacity', function (d) {
        return d.state.alpha;
      }).style('fill', function (d) {
        return d.state.color;
      }).style('stroke', function (d) {
        return d.state.boundary_color;
      }).style('stroke-width', function (d) {
        return d.state.boundary_width;
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