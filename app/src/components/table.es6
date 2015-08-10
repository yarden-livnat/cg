/**
 * Created by yarden on 8/4/15.
 */

import * as d3 from 'd3'

export default function(container, id) {
  let SORT_OP = [
    { func: d3.ascending, symbol: "fa-sort-asc"},
    { func: d3.descending, symbol: "fa-sort-desc"}
  ];

  container = container instanceof Array && container || d3.select(container);

  let table = container.append('table').attr('id', id),
      thead = table.append('thead').append('tr'),
      tbody = table.append('tbody'),
      dispatch = d3.dispatch('click', 'mouseover', 'mouseout'),
      columns,
      sortCol, sortHeader,
      data;

  function capitalize(str, def = "") {
    return str && str.length > 0 && str[0].toUpperCase() + str.substr(1) || def;
  }

  function f(field) {
    return typeof field == 'string' ? o => o[field] : o => field;
  }

  function onSort(col) {
    if (sortHeader == this) {
      col.sortOrder = !col.sortOrder;
    } else if (sortHeader) {
      d3.select(sortHeader).classed('asc desc', false);
    }

    d3.select(this)
      .classed({asc: col.sortOrder, desc: !col.sortOrder});

    sortHeader = this;
    sortCol = col;

    sortTable();
  }

  function sortTable() {
    if (!sortCol) return;
    let sortFunc = sortCol.sortOrder && d3.ascending || d3.descending;
    tbody.selectAll('tr')
      .sort( (a, b) => sortFunc(sortCol.cellValue(a), sortCol.cellValue(b)));
  }

  return {
    header(columnsDef) {
      columnsDef = typeof columnsDef == 'string' && columnsDef.split(',') || columnsDef;
      columns = columnsDef.map( col => {
        col = typeof col == 'string' && { name: col } || col;
        col.title = col.title || capitalize(col.name, '?');
        col.cellValue = col.cellValue || f(col.name);
        col.cellAttr = col.cellAttr || f({});
        col.attr = col.attr || "tableColHeader";
        col.sortOrder = col.sortOrder || 0;
        col.render = col.render || 'text';

        return col;
      });

      let h = thead.selectAll('th')
        .data(columns);

      h.enter().append('th')
        .attr('class', c => c.attr)
        .on('click', onSort);

      h.text(c => c.title);

      h.exit().remove();

      h.each( function(d) { d.minWidth = d3.select(this).style('width'); });

      return this;
    },

    data(list) {
      if (!arguments.length) return data;

      data = list;
      let rows = tbody.selectAll('tr')
        .data(list, columns[0].cellValue);

      rows.enter().append('tr');
      rows.exit().remove();

      let cells = rows.selectAll('td')
        .data(row => columns.map(c => ({ col: c, value: c.cellValue(row), attr: c.cellAttr(row), row:row })));

      cells.enter().append('td')
        //.attr('class', d => d.col.attr)
        .attr('min-width', d => d.col.minWidth)
        .on('click', function(d)  {dispatch.click(d); })
        .on('mouseover', function(d) { dispatch.mouseover(d); })
        .on('mouseout', function(d) { dispatch.mouseout(d); });

      cells.attr('class', d => d.col.cellAttr(d.row));

      cells.filter(d => d.col.render == 'text')
        .text( d => d.value)
        .classed( d => d.attr );

      for (let col of columns) {
        if (col.render != 'text') {
          cells.filter( d => d.col == col)
            .call(col.render);
        }
      }

      cells.exit().remove();

      sortTable();

      // adjust header cols width
      let i = 0;
      for (let c of tbody.select('tr').selectAll('td')[0]) {
        columns[i++].width = parseInt(d3.select(c).style('width'));
      }
      if (columns.length > 0) columns[columns.length-1].width += 15;
      thead.selectAll('th').data(columns).attr('width', d => d.width);

      return this;
    },


    row(filter) {
      return tbody.selectAll('tr').filter(filter);
    },

    cell(rfilter, cfilter) {
      return row(rfilter).filter(cfilter);
    },

    on(type, cb) {
      dispatch.on(type, cb);
      return this;
    }
  }
}