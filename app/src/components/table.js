/**
 * Created by yarden on 8/4/15.
 */

import * as d3 from 'd3'

export default function(container, id) {
  let SORT_OP = [
    { func: d3.ascending, symbol: "fa-sort-asc"},
    { func: d3.descending, symbol: "fa-sort-desc"}
  ];

  container = container instanceof d3.selection && container || d3.select(container);

  let table = container.append('table').attr('class', 'info-table'),
      thead = table.append('thead').append('tr'),
      tbody = table.append('tbody'),
      dispatch = d3.dispatch('click', 'mouseover', 'mouseout'),
      columns,
      sortCol, sortHeader,
      data;

  if (id) { table.attr('id', id);}

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
    id(_) {
      table.attr('id', _);
    },

    header(columnsDef) {
      columnsDef = typeof columnsDef == 'string' && columnsDef.split(',') || columnsDef;
      columns = columnsDef.map( col => {
        col = typeof col == 'string' && { name: col } || col;
        col.title = col.title || capitalize(col.name, '?');
        col.cellValue = col.cellValue || f(col.name);
        col.cellAttr = col.cellAttr || f({});
        col.attr = col.attr || '';
        col.sortOrder = col.sortOrder || 0;
        col.render = col.render || 'text';

        return col;
      });

      let h = thead.selectAll('th')
        .data(columns);

      h.exit().remove();

      h.enter().append('th')
        .attr('class', 'tableColHeader')
        .on('click', onSort)
        .merge(h)
          .text(c => c.title)
          .each( function(d) { d.minWidth = parseInt(d3.select(this).style('width')); });

      return this;
    },

    data(list) {
      if (!arguments.length) return data;

      data = list;
      let rows = tbody.selectAll('tr')
        .data(list, columns[0].cellValue);

      rows.exit().remove();

      rows = rows.enter().append('tr').merge(rows);

      let cells = rows.selectAll('td')
        .data(row => columns.map(c => ({ col: c, value: c.cellValue(row), attr: c.cellAttr(row), row:row })));

      cells.exit().remove();

      let all = cells.enter().append('td')
        //.attr('class', d => d.col.attr)
        .attr('width', d => d.col.minWidth)
        .on('click', function(d)  {dispatch.call('click', this, d); })
        .on('mouseover', function(d) { dispatch.call('mouseover',this, d); })
        .on('mouseout', function(d) { dispatch.call('mouseout',this, d); })
        .merge(cells);

      all.filter(d => d.col.render == 'text')
        .text( d => d.value)
        .style('color', d => d.row.color)
        .classed('selected', d => d.row.classes && d.row.classes.selected)
        .classed('excluded', d => d.row.classes && d.row.classes.excluded);


      for (let col of columns) {
        if (col.render != 'text') {
          all.filter( d => d.col == col)
            .call(col.render);
        }
      }

      sortTable();

      // adjust header cols width
      let i = 0;
      tbody.select('tr').selectAll('td')
        .each(function(d) {
          columns[i++].width = parseInt(d3.select(this).style('width'));
        });
      // for (let c of tbody.select('tr').selectAll('td')[0]) {
      //   columns[i++].width = parseInt(d3.select(c).style('width'));
      // }
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