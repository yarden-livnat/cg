/**
 * Created by yarden on 7/3/15.
 */

import {MAP_DEFAULTS} from './config';
import * as d3 from 'd3';
import * as L from 'leaflet';

export default function (opt) {

  const AREA_ALPHA = 0.6;
  const POPULATION_FACTOR = 1000;
  const DURATION = 500;

  const BOUNDARY_HIGHLIGHT_WIDTH = '1.5px';
  const BOUNDARY_ACTIVE_WIDTH = '0.5px';
  const BOUNDARY_NON_ACTIVE_WIDTH = '0';

  const BOUNDARY_SELECTED_COLOR = 'blue';
  const BOUNDARY_ACTIVE_COLOR = '#333';
  const BOUNDARY_NON_ACTIVE_COLOR = '#333';

  let format = d3.format('4.2f');

  let colorScale = d3.interpolateLab('#fff', '#f00');
  let width, height;
  let population = new Map();
  let selection;
  let zipcodes = new Map();
  let active = new Map();
  let current = new Map();
  let svg, svgContainer;
  let selectedZipcodes = [];

  // options = Object.assign({}, MAP_DEFAULTS, opt);
  let options = MAP_DEFAULTS;
  let map = new L.Map('map')
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
        d.state = {n: 0, boundary_color: BOUNDARY_NON_ACTIVE_COLOR, boundary_width: BOUNDARY_NON_ACTIVE_WIDTH};
      });

      let feature = svg.selectAll("path")
        .data(collection.features, function(d) { return d.properties.Zip_Code;})
        .enter()
          .append("path")
          .on('mouseenter', d => { showInfo(d.properties.Zip_Code, true); })
          .on('mouseout', d => { showInfo(d.properties.Zip_Code, false); })
          .on('click', d => { selectZipcode(d.properties.Zip_Code, d3.event.metaKey);});

      function update() {
        feature.attr("d", path);
      }

      map.on('viewreset', update);
      update();
    });
  }

  function showInfo(zipcode, show) {
    let cases = current.get(zipcode);
    if (show && cases) {
      let rate = format(cases * POPULATION_FACTOR/population.get(zipcode));
      d3.select('#map-info').text(`Zipcode: ${zipcode} cases:${cases}  rate:${rate}`);
    } else {
      d3.select('#map-info').text('');
    }

    let feature = zipcodes.get(zipcode);
    feature.state.highlight = show;
    feature.state.boundary_width = show && cases ? BOUNDARY_HIGHLIGHT_WIDTH : cases ? BOUNDARY_ACTIVE_WIDTH : BOUNDARY_NON_ACTIVE_WIDTH;

    svg.selectAll('path').filter( d => { return d.properties.Zip_Code == zipcode;})
      .style('stroke-width', feature.state.boundary_width);
  }

  function selectZipcode(zipcode, append) {
    d3.event.preventDefault();
    let update = [];
    if (!append) {
      if (selectedZipcodes.length == 1 && selectedZipcodes[0] == zipcode) {
        select(zipcode, false);
        update = [zipcode];
        selectedZipcodes = [];
      }
      else {
        select(selectedZipcodes, false);
        select(zipcode, true);
        update = selectedZipcodes;
        selectedZipcodes = [zipcode];
        if (update.indexOf(zipcode) == -1) update.push(zipcode);
      }
    } else {
      let i = selectedZipcodes.indexOf(zipcode);
      if (i == -1) {
        select(zipcode, true);
        selectedZipcodes.push(zipcode);
      }
      else {
        select(zipcode, false);
        selectedZipcodes.splice(i, 1);
      }
      update = [zipcode];
    }

    console.log('selected: '+selectedZipcodes);
    svg.selectAll('path').filter( d => update.indexOf(d.properties.Zip_Code) != -1 )
      .each(d => { console.log(d+': '+d.state.boundary_color);})
      .style('stroke', d => d.state.boundary_color );
  }

  function select(zipcode, on) {
    if (!zipcode) return;
    let list = zipcode instanceof Array && zipcode || [zipcode];
    for (let z of list) {
      let feature = zipcodes.get(z);
      feature.state.selected = on;
      feature.state.boundary_color = on ? BOUNDARY_SELECTED_COLOR : feature.n > 0 ? BOUNDARY_ACTIVE_COLOR : BOUNDARY_NON_ACTIVE_COLOR;
    }
  }

  function projectPoint(x, y) {
    let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function assignColor(zipcode, n) {
    let f =  Math.min(n * POPULATION_FACTOR/population.get(zipcode), 1);
    return colorScale(f);
  }

  function selectionChanged() {
    current = new Map();
    selection.domain.forEach(enc => {
      if (population.has(enc.zipcode)) {
        let count = current.get(enc.zipcode) || 0;
        current.set(enc.zipcode, count+1);
      }
    });

    let update = [];
    current.forEach((n, zipcode) => {
      let feature = zipcodes.get(zipcode);
      if (feature) {
        feature.state.alpha = AREA_ALPHA;
        feature.state.color = assignColor(zipcode, n);
        feature.state.active = true;
        feature.state.boundary_width = BOUNDARY_ACTIVE_WIDTH;
        feature.state.boundary_color = feature.state.selected ? BOUNDARY_SELECTED_COLOR : BOUNDARY_ACTIVE_COLOR;
        update.push(feature);
      }
    });
    active.forEach((n, zipcode) => {
      if (!current.has(zipcode)) {
        let feature = zipcodes.get(zipcode);
        feature.state.color = '#fff';
        feature.state.alpha = 0;
        feature.state.active = false;
        feature.state.boundary_width = BOUNDARY_NON_ACTIVE_WIDTH;
        update.push(feature);
      }
    });

    let s = svg.selectAll('path')
      .data(update, d => {return d.properties.Zip_Code;})
      .transition()
        .duration(DURATION)
        .style('fill-opacity', d => { return d.state.alpha})
        .style('fill', d => { return d.state.color})
        .style('stroke', d => { return d.state.boundary_color; })
        .style('stroke-width', d => { return d.state.boundary_width; });

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