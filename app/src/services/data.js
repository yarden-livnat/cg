define(['exports', 'd3', 'queue', 'postal'], function (exports, _d3, _queue, _postal) {
  /**
   * Created by yarden on 7/13/15.
   */
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;
  exports.fetchAssociations = fetchAssociations;

  var dateFormat = _d3.time.format('%Y-%m-%d');
  var post = _postal.channel('data');

  var items = new Map();
  var kb = new Map();

  var fromDate = Date.now();
  exports.fromDate = fromDate;
  var toDate = Date.now();

  exports.toDate = toDate;
  var tags = [];
  exports.tags = tags;
  var domain = [];
  exports.domain = domain;
  var population = new Map();

  exports.population = population;
  var ignore_tags = ['conjunctivitis'];
  var ignore = [];

  function init() {
    (0, _queue)().defer(_d3.json, '/data/kb').defer(_d3.csv, '/data/population').await(function (err, kbData, popData) {
      kbData.forEach(function (d) {
        d.label = d.details == '' ? d.name : d.name + '[' + d.details + ']';
        kb.set(d.id, d);
        if (ignore_tags.indexOf(d.name) != -1) ignore.push(d.id);
      });

      popData.forEach(function (d) {
        population.set(d.zipcode, +d.population);
      });
      post.publish('ready');
    });
  }

  function fetchAssociations(params) {

    var uri = '/query?';
    uri += 'from=' + params.from;
    uri += '&to=' + params.to;

    _d3.json(uri, function (err, data) {
      exports.tags = tags = [];
      exports.domain = domain = data.enc;

      var map = new Map();

      data.enc.forEach(function (d) {
        d.date = dateFormat.parse(d.date);
        items.set(d.id, d);
      });

      data.associations.forEach(function (d) {
        if (ignore.indexOf(d.tag_id) == -1) {
          var entry = map.get(d.tag_id);
          if (!entry) {
            entry = { id: d.tag_id, concept: kb.get(d.tag_id), items: [] };
            map.set(d.tag_id, entry);
            tags.push(entry);
          }
          entry.items.push(items.get(d.enc_id));
        }
      });

      // TODO: handle probabilities

      exports.fromDate = fromDate = dateFormat.parse(params.from);
      exports.toDate = toDate = dateFormat.parse(params.to);
      post.publish('changed');
    });
  }
});

//# sourceMappingURL=data.js.map