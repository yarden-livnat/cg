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
  var default_color = "gray";

  function assign_color(obj) {
    if (!obj.color || obj.color == default_color) {
      obj.color = available_colors.shift() || default_color;
    } else {
      var i = available_colors.indexOf(obj.color);
      if (i == -1) {
        obj.color = available_colors.shift() || default_color;
      } else {
        available_colors.splice(i, 1);
      }
    }
  }

  function release_color(obj) {
    if (obj.color != default_color) {
      available_colors.push(obj.color);
    } else {
      obj.color = undefined;
    }
  }

  function reset_colors() {
    available_colors = _d3.scale.category10().range().concat();
  }
});

//# sourceMappingURL=utils.js.map