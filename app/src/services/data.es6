/**
 * Created by yarden on 7/13/15.
 */
import * as d3 from 'd3'
import * as postal from 'postal'

let dateFormat = d3.time.format('%Y-%m-%d');

let encounters = new Map();
let associations = new Map();
let kb = new Map();

export function init() {
  d3.json('/kb', function(data) {
    data.forEach(d => kb.set(d.id, d));
  });
}

export function fetchAssociations(params) {

  let uri = '/query?';
  uri += 'from='+params.from;
  uri += '&to='+params.to;

  d3.json(uri, function(err, data) {
    associations = new Map();

    data.enc.forEach(d  => encounters.set(d.id, d));

    data.associations.map(d => {
      let entry = associations.get(d.tag_id);
      if (!entry) {
        entry = {tid: d.tag_id, enc: []};
        associations.set(d.tag_id, entry);
      }
      entry.enc.push(d.enc_id);
    });

    console.debug('data:',data);
    console.debug('enc:'+encounters.size+'  assoc:'+associations.size);

    postal.publish('data.changed');

  });
}