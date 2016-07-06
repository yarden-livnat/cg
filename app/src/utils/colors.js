/**
 * Created by yarden on 11/9/15.
 */

import * as d3 from 'd3'

let available_colors =  d3.scaleOrdinal(d3.schemeCategory10).range().concat();
let default_color = "black";

export function assign_color(obj) {
  if (!obj.prevColor || obj.prevColor == default_color) {
    obj.color = available_colors.shift() || default_color;
  } else {
    let i = available_colors.indexOf(obj.prevColor);
    if (i == -1) {
      obj.color = available_colors.shift() || default_color;
    } else {
      available_colors.splice(i, 1);
      obj.color = obj.prevColor;
    }
  }
}

export function release_color(obj) {
  if (obj.color != default_color) {
    available_colors.push(obj.color);
  }
  obj.prevColor = obj.color;
  obj.color = default_color;
}

export function reset_colors() {
  available_colors = d3.scale.category10().range().concat();
}