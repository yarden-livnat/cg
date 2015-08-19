/**
 * Created by yarden on 8/6/15.
 */

import * as Tables from './info-tables';
import * as Charts from './info-charts';
import Detectors from './info-detectors';


export default function () {

  let tables = Tables();
  let charts = Charts();
  let detectors = Detectors();

  return {
    init() {
      tables.init();
      charts.init();
      detectors.init();
      return this;
    },

    selection(s) {
      tables.selection(s);
      charts.selection(s);
      detectors.selection(s);
      return this;
    },

    resize() {
      tables.resize();
      charts.resize();
    }
  }
}