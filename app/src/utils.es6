/**
 * Created by yarden on 12/29/14.
 */

import * as d3 from 'd3'

export function capitalize (str) {
      return str.charAt(0).toUpperCase()+str.substring(1);
}

let tags_colors = d3.scale.category10();

export function tagColor(tag) {

}