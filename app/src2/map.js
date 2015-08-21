define(['exports', 'module', 'd3', 'queue', 'leaflet', './config'], function (exports, module, _d3, _queue, _leaflet, _config) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _queue2 = _interopRequireDefault(_queue);

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

    var format = _d32['default'].format('4.2f');

    var colorScale = _d32['default'].interpolateLab('#fff', '#f00');
    var width = undefined,
        height = undefined;
    var population = new Map();
    var selection = undefined;
    var zipcodes = new Map();
    var active = new Map();
    var current = new Map();
    var svg = undefined,
        svgContainer = undefined;
    var selectedZipcodes = new Set();
    var selectionFilter = Filter();

    //let options = Object.assign({}, MAP_DEFAULTS, opt);
    var options = _config.MAP_DEFAULTS;
    var map = new _leaflet.Map('map').addLayer(_leaflet.tileLayer(options.mapbox.url, options.mapbox.opt)).setView(options.center, options.zoom);

    var transform = _d32['default'].geo.transform({ point: projectPoint });
    var path = _d32['default'].geo.path().projection(transform);

    /* Initialize the SVG layer */
    map._initPathRoot();

    svgContainer = _d32['default'].select('#map').select('svg');
    svg = svgContainer.append('g');

    function _init(cb) {
      (0, _queue2['default'])().defer(_d32['default'].json, options.zipcodes_file).defer(_d32['default'].csv, '/data/population').await(function (err, collection, pop) {
        if (!err) {
          (function () {
            var update = function () {
              feature.attr('d', path);
            };

            // population
            pop.forEach(function (d) {
              population.set(d.zipcode, +d.population);
            });

            // zipcodes
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
              selectZipcode(d.properties.Zip_Code, _d32['default'].event.metaKey);
            });

            map.on('viewreset', update);
            update();
          })();
        }
        cb(err);
      });
    }

    function showInfo(zipcode, show) {
      var cases = current.get(zipcode);
      if (show && cases) {
        var rate = format(cases * POPULATION_FACTOR / population.get(zipcode));
        _d32['default'].select('#map-info').text('Zipcode: ' + zipcode + ' cases:' + cases + '  rate:' + rate);
      } else {
        _d32['default'].select('#map-info').text('');
      }

      var feature = zipcodes.get(zipcode);
      feature.state.highlight = show;
      feature.state.boundary_width = show && cases ? BOUNDARY_HIGHLIGHT_WIDTH : cases ? BOUNDARY_ACTIVE_WIDTH : BOUNDARY_NON_ACTIVE_WIDTH;

      svg.selectAll('path').filter(function (d) {
        return d.properties.Zip_Code == zipcode;
      }).style('stroke-width', feature.state.boundary_width);
    }

    function selectZipcode(zipcode, append) {
      _d32['default'].event.preventDefault();

      var updated = new Set();
      var active = selectedZipcodes.has(zipcode);
      if (append) {
        if (active) selectedZipcodes['delete'](zipcode);else selectedZipcodes.add(zipcode);

        update(zipcode, !active);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = selectedZipcodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var z = _step.value;

            update(z, false);
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

        selectedZipcodes.clear();
        if (!active) {
          selectedZipcodes.add(zipcode);
          update(zipcode, true);
        }
      }

      svg.selectAll('path').filter(function (d) {
        return updated.has(d.properties.Zip_Code);
      }).style('stroke', function (d) {
        return d.state.boundary_color;
      });

      selectionFilter.domain(selectedZipcodes);

      function update(zipcode, on) {
        var feature = zipcodes.get(zipcode);
        feature.state.selected = on;
        feature.state.boundary_color = on ? BOUNDARY_SELECTED_COLOR : feature.n > 0 ? BOUNDARY_ACTIVE_COLOR : BOUNDARY_NON_ACTIVE_COLOR;
        updated.add(zipcode);
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

    function Filter() {
      var dispatch = _d32['default'].dispatch('change');
      var items = undefined;

      var f = function f(list) {
        return !items || items.size == 0 ? list : list.filter(function (item) {
          return items.has(item.zipcode);
        });
      };

      f.domain = function (d) {
        items = d;
        dispatch.change();
      };

      f.on = function (type, cb) {
        dispatch.on(type, cb);
      };

      return f;
    }

    return {
      init: function init(cb) {
        _init(cb);
      },

      resize: function resize(w, h) {
        width = w;
        height = h;
        svgContainer.attr('width', w).attr('height', h);
        return this;
      }
    };
  };
});

//# sourceMappingURL=map.js.map