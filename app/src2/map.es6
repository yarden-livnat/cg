/**
 * Created by yarden on 8/21/15.
 */

import d3 from 'd3';
import queue from 'queue';
import postal from 'postal';
import * as L from 'leaflet';

import {MAP_DEFAULTS} from './config';
import * as patients from './patients';
import colorbrewer from './colorbrewer';

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

  const RATE_POPULATION = 0;
  const RATE_RELATIVE = 1;

  let color = d3.scale.quantize().range(colorbrewer['YlOrRd'][9]);
  let format = d3.format('4.2f');

  let colorScale = d3.interpolateLab('#fff', '#f00');
  let width, height;
  let population = new Map();

  //let zipcodes = new Map();
  //let active = new Map();
  //let current = new Map();
  let svg, svgContainer;

  let dirty = false;
  let dimension = patients.enc_zipcode;
  let features;
  let selectedZipcodes = new Set();
  let rate_mode = RATE_RELATIVE;

  //let options = Object.assign({}, MAP_DEFAULTS, opt);
  let options = MAP_DEFAULTS;
  let map = new L.Map('map')
    .addLayer(L.tileLayer(options.mapbox.url, options.mapbox.opt))
    .setView(options.center, options.zoom);

  let transform = d3.geo.transform({point: projectPoint});
  let path = d3.geo.path().projection(transform);


  postal.subscribe({channel: 'global', topic: 'render', callback: render});

  /* Initialize the SVG layer */
  map._initPathRoot();

  svgContainer = d3.select('#map').select('svg');
  svg = svgContainer.append('g');

  //d3.select('#map-rate')
  //  .on('change', function() {
  //    rate_mode = this.value;
  //    render();
  //});

  function init(cb) {
    queue()
      .defer(d3.json, options.zipcodes_file)
      .defer(d3.csv, '/data/population')
      .await( (err, collection, pop)  => {
        if (!err) {
          // population
          pop.forEach(function(d) { population.set(d.zipcode, +d.population);});

          // zipcodes
          features = collection.features;
          features.forEach(f => {
            f.population = population.get(f.properties.Zip_Code) || 0;
            f.pop_factor = f.population && POPULATION_FACTOR/f.population || 0;
            f.active = 0;
          });

          let feature = svg.selectAll("path")
            .data(features, function(d) { return d.properties.Zip_Code;})
            .enter()
            .append("path")
              .on('mouseenter', function(d) { showInfo(d, true); })
              .on('mouseout', function(d) { showInfo(d, false); })
              .on('click', selectZipcode);

          function update() {
            feature.attr("d", path);
          }

          map.on('viewreset', update);
          update();
        }
        cb(err);
      });
  }

  function showInfo(d, show) {
    if (show) {
      d3.select('#map-info').text(`Zipcode: ${d.properties.Zip_Code} pop:${d.population} cases:${d.active}  rate:${format(d.rate)}`);
      renderOne(d);
    } else {
      d3.select('#map-info').text('');
    }
  }

  function selectZipcode(d) {
    d3.event.preventDefault();

    let zipcode = d.properties.Zip_Code;
    let active = selectedZipcodes.has(zipcode);
    let add = false;

    if (!d3.event.metaKey) {
      selectedZipcodes.clear();
      add = !active;
    } else {
      add  = !selectedZipcodes.delete(zipcode);
    }

    if (add) {
      selectedZipcodes.add(zipcode);
    }

    svg.selectAll("path").data(features)
      .classed('selected', d => selectedZipcodes.has(d.properties.Zip_Code) );

    if (selectedZipcodes.size > 0)
      dimension.filter( d => selectedZipcodes.has(d));
    else
      dimension.filterAll();

    patients.update(dimension);
    postal.publish({channel: 'global', topic: 'render'});
  }

  function projectPoint(x, y) {
    let point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }


  function renderOne(node) {
    svg.selectAll("path").data(node, function (d) { return d.properties.Zip_Code;})
      .style('fill-opacity', d => AREA_ALPHA )
      .style('fill', function (d) { return colorScale(Math.min(d.rate, 1)); });
  }

  function render() {
    if (dirty) dirty = false;
    else {
      let active = new Map();
      for(let z of dimension.group().top(Infinity)) {
        active.set(z.key, z.value);
      }

      let list = [];
      let max_rate = 0;
      for(let f of features) {
        f.active = active.get(f.properties.Zip_Code) || 0;
        f.rate = f.active * f.pop_factor;
        f.selected =  selectedZipcodes.has(f.properties.Zip_Code);
        if (max_rate < f.rate) max_rate = f.rate;
        if (f.active) {
          list.push(f);
        }
      }
      color.domain([0, rate_mode == RATE_RELATIVE && max_rate  || 1]);

      list.sort(function(a, b) { return a.selected == b.selected ? 0 : a.selected ? 1 : -1; });

      let paths = svg.selectAll("path")
        .data(list, function (d) { return d.properties.Zip_Code;});

      paths
        .transition()
        .duration(DURATION)
        .style('fill-opacity', d => AREA_ALPHA )
        .style('fill', function (d) { return color(d.rate); }); //colorScale(Math.min(d.rate, 1)); });

      paths.exit()
        .transition()
        .duration(DURATION)
          .style('fill-opacity', 0)
          .style('fill', '#fff');
    }
  }

  return {
    init(cb) { init(cb); },

    resize(w, h) {
      width = w;
      height = h;
      svgContainer.attr("width", w).attr("height", h);
      return this;
    }
  };
}
