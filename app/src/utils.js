define(['exports', 'd3'], function (exports, _d3) {
  /**
   * Created by yarden on 12/29/14.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.capitalize = capitalize;
  exports.tagColor = tagColor;

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  var tags_colors = _d3.scale.category10();

  function tagColor(tag) {}
});

//# sourceMappingURL=utils.js.map