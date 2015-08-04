/**
 * Created by yarden on 12/29/14.
 */

import * as d3 from 'd3'
import {capitalize} from '../utils'

export default function() {
  let SORT_OP = [
    { func: d3.ascending, symbol: "fa-sort-asc"},
    { func: d3.descending, symbol: "fa-sort-desc"}
    ];

  let d3el, header, data;
  let width, height;
  let valid = false;
  let columns = [];
  let sortCol;
  let table, thead, tbody;
  let dispatch = d3.dispatch('click');

  function identity() {
    return this;
  }

  function validate() {
    valid =  d3el && data; // && key; //&& width && height
  }

  function showSort(name, opt) {
    let node = header.select('#'+name).select('.fa');
    if (opt !== false) {
      node.classed(SORT_OP[1 - opt].symbol, false);
      node.classed(SORT_OP[opt].symbol, true);
    }
    node.style('visibility',opt === false ? 'hidden' : 'visible');
  }

  function sort(col) {
    sortCol = col;
    showSort(col.name,  col.sortOrder);

    let compare = SORT_OP[col.sortOrder].func;
    let field = sortCol.name;
    data.sort(function(a, b) { return compare(a[field], b[field]); });

    update();
  }

  function onSort(col) {
    if (sortCol && sortCol.name != col.name)
      showSort(sortCol.name, false);
    else
      col.sortOrder = 1-col.sortOrder;
    sort(col);
  }

  function update() {
   if (!valid) return;

    header = thead.selectAll('th').data(columns);

    let colHeader = header.enter()
      .append('th')
      .attr('class', function(d) { return d.class; })
      .append('g')
      .attr('id', function(d) {return d.name; });

    colHeader.append('text')
      .text(function(col) { return col.title;} )
      .on('click', onSort);

    colHeader.append('i')
      .attr('class', 'fa')
      .attr('width', '10px')
      .style('padding-left', '5px');

    header.exit().remove();

    let rows = tbody.selectAll('tr')
      .data(data);

    rows.enter().append('tr')
      .selectAll('td')
      .data(columns);

    rows.exit().remove();

    // update
    let cells = rows.selectAll('td')
      .data(function(row) {
        return columns.map(function(col) {
          return {col: col.name, value: col.value(row) /*[col.name]*/, klass: col.class, row:row};
        })
      });

    cells.enter().append('td')
      .on('click', function(d) {
        dispatch.click(d.row);
      });

    cells
      .text(function(d) { return d.value; })
      .attr('class', function(d) { return d.klass;});

    cells.exit().remove();
  }

  function convert(cols) {
    cols = typeof cols == 'string' ? cols.split(', ') : cols;
    return cols.map(function(col) {
      if (typeof col == 'string')
        col = {name: col};

      col.title = col.title || capitalize(col.name);
      col.sortOrder = col.sortOrder || 0;
      col.value = col.value || function(d) { return d[col.name]; };
      col.attr = col.attr || function(d) { return d['attr'] && d['attr'][col.name]; }
      return col;
    });
  }

  return {

    el(el) {
      if (!arguments.length) return d3el;
      d3el = typeof el == 'string' ? d3.select(el) : el;
      table = d3el;

      if (width) table.attr('width', width);
      if (height) table.attr('height', height);

      thead = table.append('thead').append('tr');
      tbody = table.append('tbody');

      validate();
      update();
      return this;
    },

    width(value) {
      if (!arguments.length) return width;
      width = value;
      if (table) {
        table.attr('width', width);
      }
      return this;
    },

    height(value) {
      if (!arguments.length) return height;
      height = value;
      if (table) {
        table.attr('height', height);
      }
      return this;
    },

    data(value) {
      if (!arguments.length) return data;
      data = value;
      if (sortCol) sort(sortCol);
      validate();
      update();
      return this;
    },

    columns(value) {
      if (!arguments.length) return columns;
      columns = convert(value);
      validate();
      update();
      return this;
    },

    on(type, listener) {
      dispatch.on(type, listener);
      return this;
    },

    update() {
      update();
      return this;
    },

    row(f) {
      return tbody.selectAll('tr').filter(f);
    }
  };
}
