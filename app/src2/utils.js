define(["exports", "d3"], function (exports, _d3) {
  /**
   * Created by yarden on 11/9/15.
   */

  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.assign_color = assign_color;
  exports.release_color = release_color;
  exports.reset_colors = reset_colors;

  var available_colors = _d3.scale.category10().range().concat();
  var default_color = "black";

  function assign_color(obj) {
    if (!obj.prevColor || obj.prevColor == default_color) {
      obj.color = available_colors.shift() || default_color;
    } else {
      var i = available_colors.indexOf(obj.prevColor);
      if (i == -1) {
        obj.color = available_colors.shift() || default_color;
      } else {
        available_colors.splice(i, 1);
        obj.color = obj.prevColor;
      }
    }
  }

  function release_color(obj) {
    if (obj.color != default_color) {
      available_colors.push(obj.color);
    }
    obj.prevColor = obj.color;
    obj.color = default_color;
  }

  function reset_colors() {
    available_colors = _d3.scale.category10().range().concat();
  }
});

//# sourceMappingURL=utils.js.map