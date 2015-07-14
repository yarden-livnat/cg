/**
 * Created by yarden on 6/30/15.
 */

console.log('in app');
import * as xpanel from './components/xpanel';
import * as Formater from 'formatter';
import * as Map from 'map/Map';
import * as data from 'services/data';
import * as query from 'query';

let map = Map('map');

initHTML();
initModules();

function initHTML() {
  xpanel.init();

  let duration_input = document.getElementById('duration-input');
  if (duration_input) {
    new Formater(duration_input, {
      pattern: "{{99}}"
    });
  }
}

function initModules() {
  data.init();
  query.init();
}