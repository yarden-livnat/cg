define(['exports', 'd3'], function (exports, _d3) {
  /**
   * Created by yarden on 7/3/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var MAP_DEFAULTS = {
    mapbox: {
      url: 'https://a.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={access_token}',
      opt: {
        id: 'yarden.mi9kei3m',
        access_token: 'pk.eyJ1IjoieWFyZGVuIiwiYSI6ImM5NzdkZTdhZTBlOWFmNDlkM2M1MmEyY2M1NjkzOTg3In0.VZytH8boHpDX-J9PaxDjpA'
      }
    },
    center: [39.58, -111.5],
    zoom: 6,
    zipcodes_file: 'assets/maps/ut-zipcodes.json'
  };

  exports.MAP_DEFAULTS = MAP_DEFAULTS;
  var cg = {
    canvas: {
      colors: {},

      // edges
      showEdges: 'none',
      edgeValueSelection: [0, 1],
      edgeOpacity: 0.2,
      edgeStrength: 0,
      edgeScale: _d3.scale.log().domain([0.1, 1]).range([0.4, 2.5]),

      // nodes
      nodeRadius: 3,
      nodeScale: _d3.scale.linear().domain([0.3, 1]).range([0.3, 1]).clamp(true),

      duration: 500,
      fastDuration: 50
    },

    control: {
      overlap: false
    },

    layout: {
      // layout
      clampToWindow: false,
      initIterations: 250,
      onlyVisibleNodes: false,

      minSpeed: 2,
      separation: 50,
      distScale: _d3.scale.log().domain([0.1, 1]).range([300, 50]),

      //force
      charge: -500,
      friction: 0.9,
      gravity: 0.1,
      linkStrength: 1,
      linkDistanceFactor: 100
    }
  };
  exports.cg = cg;
});

//# sourceMappingURL=config.js.map