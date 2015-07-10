/**
 * Created by yarden on 7/7/15.
 */

import * as $ from 'jquery'

let tags = new Map();
export function init() {
  $.get('/kb', function(data) {
    console.log('kb:',data);
  }, 'json');
}