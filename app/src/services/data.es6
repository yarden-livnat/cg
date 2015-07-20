/**
 * Created by yarden on 7/13/15.
 */
import * as d3 from 'd3'
import * as postal from 'postal'

let dateFormat = d3.time.format('%Y-%m-%d');

let items = new Map();
let kb = new Map();

export let tags = [];
export let domain = [];

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
    tags = [];
    domain = data.enc;

    let map = new Map();

    data.enc.forEach(d  => items.set(d.id, d));

    data.associations.forEach(d => {
      let entry = map.get(d.tag_id);
      if (!entry) {
        entry = {id: d.tag_id, concept: kb.get(d.tag_id), items: []};
        map.set(d.tag_id, entry);
        tags.push(entry);
      }
      entry.items.push(d.enc_id);
    });

    // TODO: handle probabilities

    postal.publish({channel: 'data', topic: 'changed'});
  });
}

