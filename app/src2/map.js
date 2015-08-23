define(['exports', 'module', 'd3', 'queue', 'postal', 'leaflet', './config', './patients'], function (exports, module, _d3, _queue, _postal, _leaflet, _config, _patients) {
  /**
   * Created by yarden on 8/21/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _queue2 = _interopRequireDefault(_queue);

  var _postal2 = _interopRequireDefault(_postal);

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

    var dirty = false;
    var dimension = _patients.enc_zipcode;
    var features = undefined;

    var selectedZipcodes = new Set();

    //let options = Object.assign({}, MAP_DEFAULTS, opt);
    var options = _config.MAP_DEFAULTS;
    var map = new _leaflet.Map('map').addLayer(_leaflet.tileLayer(options.mapbox.url, options.mapbox.opt)).setView(options.center, options.zoom);

    var transform = _d32['default'].geo.transform({ point: projectPoint });
    var path = _d32['default'].geo.path().projection(transform);

    _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: render });

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
            features = collection.features;
            features.forEach(function (f) {
              f.population = population.get(f.properties.Zip_Code) || 0;
              f.pop_factor = f.population && POPULATION_FACTOR / f.population || 0;
              f.active = 0;
            });

            var feature = svg.selectAll('path').data(features, function (d) {
              return d.properties.Zip_Code;
            }).enter().append('path').on('mouseenter', function (d) {
              showInfo(d, true);
            }).on('mouseout', function (d) {
              showInfo(d, false);
            }).on('click', selectZipcode);

            map.on('viewreset', update);
            update();
          })();
        }
        cb(err);
      });
    }

    function showInfo(d, show) {
      if (show) {
        _d32['default'].select('#map-info').text('Zipcode: ' + d.properties.Zip_Code + ' cases:' + d.active + '  rate:' + format(d.rate));
      } else {
        _d32['default'].select('#map-info').text('');
      }
    }

    function selectZipcode(d) {
      _d32['default'].event.preventDefault();

      var zipcode = d.properties.Zip_Code;
      var active = selectedZipcodes.has(zipcode);
      var add = false;

      if (!_d32['default'].event.metaKey) {
        selectedZipcodes.clear();
        add = !active;
      } else {
        add = !selectedZipcodes['delete'](zipcode);
      }

      if (add) {
        selectedZipcodes.add(zipcode);
      }

      svg.selectAll('path').data(features).classed('selected', function (d) {
        return selectedZipcodes.has(d.properties.Zip_Code);
      });

      if (selectedZipcodes.size > 0) dimension.filter(function (d) {
        return selectedZipcodes.has(d);
      });else dimension.filterAll();

      _patients.update(dimension);
      _postal2['default'].publish({ channel: 'global', topic: 'render' });
    }

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new _leaflet.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    function render() {
      if (dirty) dirty = false;else {
        var _active = new Map();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = dimension.group().top(Infinity)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var z = _step.value;

            _active.set(z.key, z.value);
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

        var list = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = features[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var f = _step2.value;

            f.active = _active.get(f.properties.Zip_Code) || 0;
            f.rate = f.active * f.pop_factor;
            if (f.active) list.push(f);
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

        var paths = svg.selectAll('path').data(list, function (d) {
          return d.properties.Zip_Code;
        });

        paths.transition().duration(DURATION).style('fill-opacity', function (d) {
          return AREA_ALPHA;
        }).style('fill', function (d) {
          return colorScale(Math.min(d.rate, 1));
        });

        paths.exit().transition().duration(DURATION).style('fill-opacity', 0).style('fill', '#fff');
      }
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