/**
 * Created by yarden on 11/19/15.
 */

import * as d3 from 'd3';
import postal from 'postal';

import {topicsMap} from '../service';
import * as tagSelection from '../model/tag_selection';

postal.subscribe({channel: 'global', topic: 'render', callback: update});


function update() {
  let tags = [], topic;
  if (tagSelection.selected.size > 0) {
    for(let tid of tagSelection.selected) {
      topic = topicsMap.get(tid);
      tags.push({tid: tid, topic: topic, attr: 'selected'});
    }
  }

  if (tagSelection.excluded.size > 0) {
    for(let tid of tagSelection.excluded) {
      topic = topicsMap.get(tid);
      tags.push({tid: tid, topic: topic, attr: 'excluded'});
    }
  }

  let items = d3.select('#selection-list').selectAll('li').data(tags);
  items.enter().append('li')
    .merge(items)
    .text(d => d.topic.name)
    .attr('class', d => d.attr)
    .on('click', function(d) {
      if (d3.event.metaKey) { tagSelection.exclude(d.topic.id); }
      else                  { tagSelection.select(d.topic.id); }
    });

  items.exit().remove();
}