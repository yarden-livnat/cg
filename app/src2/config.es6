/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';

export let MAP_DEFAULTS =  {
  mapbox: {
    url: "https://a.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={access_token}",
    opt: {
      id:           'yarden.mi9kei3m',
      access_token: 'pk.eyJ1IjoieWFyZGVuIiwiYSI6ImM5NzdkZTdhZTBlOWFmNDlkM2M1MmEyY2M1NjkzOTg3In0.VZytH8boHpDX-J9PaxDjpA'
    }
  },
  center: [39.58, -111.5],
  zoom: 6,
  zipcodes_file: "assets/maps/ut-zipcodes.json"
};

export let pathogens_duration = 4;

export let cgOptions = {
  canvas: {
    colors: {},

    // edges
    showEdges: 'none',
    edgeValueSelection: [0, 1],
    edgeOpacity: 0.2,
    edgeStrength: 0,
    edgeScale: d3.scale.log()
      .domain([0.1, 1])
      //.range([0.4, 2.5]),
      .range([1, 0.5])
      .clamp(true),

    // nodes
    nodeRadius: 3,
    nodeScale: d3.scale.linear()
      .domain([0.4, 1])
      .range([0.4, 1])
      .clamp(true),

    duration: 500,
    fastDuration: 50
  },

  control: {
    overlap: false
  },

  layout: {
    // layout
    clampToWindow: false,
    initIterations: 0, //250,
    onlyVisibleNodes: false,

    minSpeed: 2,
    separation: 50,
    distScale: d3.scale.log()
      .domain([0.1, 1])
      .range([300, 50]),

    //force
    charge: -500,
    friction: 0.9,
    gravity: 0.1,
    linkStrength: 1,
    linkDistanceFactor: 100
  }
};


