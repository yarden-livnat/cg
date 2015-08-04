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
      dispatch = d3.dispatch('click'),
      columns,
      sortCol;

  function capitalize(str, def = "") {
    return str && str.length > 0 && str[0].toUpperCase() + str.substr(1) || def;
  }

  function f(field) {
    return typeof field == 'string' ? o => o[field] : o => field;
  }

  function onSort(col) {
    if (sortCol == this) {
      col.sortOrder = !col.sortOrder;
    } else if (sortCol) {
      d3.select(sortCol).classed('asc desc', false);
    }

    d3.select(this)
      .classed({asc: col.sortOrder, desc: !col.sortOrder});

    sortCol = this;

    let sortFunc = col.sortOrder && d3.ascending || d3.descending;
    tbody.selectAll('tr')
      .sort( (a, b) => sortFunc(col.cellValue(a), col.cellValue(b)));
  }

  return {
    header(columnsDef) {
      columnsDef = typeof columnsDef == 'string' && columnsDef.split(',') || columnsDef;
      columns = columnsDef.map( col => {
        col = typeof col != 'string' && col || { name: col };
        col.title = col.title || capitalize(col.name, '?');
        col.cellValue = col.cellValue || f(col.name);
        col.cellAttr = col.cellAttr || f({});
        col.attr = col.attr || "tableColHeader";
        col.sortOrder = col.sortOrder || 0;

        return col;
      });

      let h = thead.selectAll('th')
        .data(columns);

      h.enter().append('th')
        .attr('class', c => c.attr)
        .on('click', onSort);

      h.text(c => c.title);

      h.exit().remove();

      return this;
    },

    data(list) {
      let rows = tbody.selectAll('tr')
        .data(list, columns[0].cellValue);

      rows.enter().append('tr');
      rows.exit().remove();

      let cells = rows.selectAll('td')
        .data(row => columns.map(c => ({ col: c, value: c.cellValue(row), attr: c.cellAttr(row), row:row })));

      cells.enter().append('td')
        .on('click', d => {dispatch.click(d);});

      cells.text( d => d.value)
        .attr('class', d => d.col.attr)
        .classed( d => d.attr );

      cells.exit().remove();
      return this;
    },

    row(filter) {
      return tbody.selectAll('tr').filter(filter);
    },

    cell(rfilter, cfilter) {
      return row(rfilter).filter(cfilter);
    }
  }
}