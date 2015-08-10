/**
 * Created by yarden on 8/6/15.
 */

import * as Tables from './info-tables';
import * as Charts from './info-charts';


export default function () {

  let tables = Tables();
  let charts = Charts();

  return {
    init() {
      tables.init();
      charts.init();
      return this;
    },

    selection(s) {
      tables.selection(s);
      charts.selection(s);
      return this;
    },

    resize() {
      tables.resize();
      charts.resize();
    }
  }
}