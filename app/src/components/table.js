define(['exports', 'module', 'd3', '../utils'], function (exports, module, _d3, _utils) {
  /**
   * Created by yarden on 12/29/14.
   */

  'use strict';

  module.exports = function () {
    var SORT_OP = [{ func: _d3.ascending, symbol: 'fa-sort-asc' }, { func: _d3.descending, symbol: 'fa-sort-desc' }];

    var d3el, header, data;
    var width, height;
    var valid = false;
    var columns = [];
    var sortCol;
    var table, thead, tbody;
    var dispatch = _d3.dispatch('click');

    function identity() {
      return this;
    }

    function validate() {
      valid = d3el && data; // && key; //&& width && height
    }

    function showSort(name, opt) {
      var node = header.select('#' + name).select('.fa');
      if (opt !== false) {
        node.classed(SORT_OP[1 - opt].symbol, false);
        node.classed(SORT_OP[opt].symbol, true);
      }
      node.style('visibility', opt === false ? 'hidden' : 'visible');
    }

    function sort(col) {
      sortCol = col;
      showSort(col.name, col.sortOrder);

      var compare = SORT_OP[col.sortOrder].func;
      var field = sortCol.name;
      data.sort(function (a, b) {
        return compare(a[field], b[field]);
      });

      update();
    }

    function onSort(col) {
      if (sortCol && sortCol.name != col.name) showSort(sortCol.name, false);else col.sortOrder = 1 - col.sortOrder;
      sort(col);
    }

    function update() {
      if (!valid) return;

      header = thead.selectAll('th').data(columns);

      var colHeader = header.enter().append('th').attr('class', function (d) {
        return d['class'];
      }).append('g').attr('id', function (d) {
        return d.name;
      });

      colHeader.append('text').text(function (col) {
        return col.title;
      }).on('click', onSort);

      colHeader.append('i').attr('class', 'fa').attr('width', '10px').style('padding-left', '5px');

      header.exit().remove();

      var rows = tbody.selectAll('tr').data(data);

      rows.enter().append('tr').selectAll('td').data(columns);

      rows.exit().remove();

      // update
      var cells = rows.selectAll('td').data(function (row) {
        return columns.map(function (col) {
          return { col: col.name, value: row[col.name], 'class': col['class'], row: row };
        });
      });

      cells.enter().append('td').on('click', function (d) {
        dispatch.click(d.row);
      });

      cells.text(function (d) {
        return d.value;
      }).attr('class', function (d) {
        return d['class'];
      });

      cells.exit().remove();
    }

    function convert(cols) {
      cols = typeof cols == 'string' ? cols.split(', ') : cols;
      return cols.map(function (col) {
        if (typeof col == 'string') col = { name: col };

        col.title = col.title || (0, _utils.capitalize)(col.name);
        col.sortOrder = col.sortOrder || 0;
        return col;
      });
    }

    function api() {}

    api.el = function (el) {
      if (!arguments.length) return d3el;
      d3el = typeof el == 'string' ? _d3.select(el) : el;
      //table = d3el.append('table')
      //  .classed('table', true);
      table = d3el;

      if (width) table.attr('width', width);
      if (height) table.attr('height', height);

      thead = table.append('thead').append('tr');
      tbody = table.append('tbody');

      validate();
      update();
      return this;
    };

    api.width = function (value) {
      if (!arguments.length) return width;
      width = value;
      if (table) {
        table.attr('width', width);
      }
      return this;
    };

    api.height = function (value) {
      if (!arguments.length) return height;
      height = value;
      if (table) {
        table.attr('height', height);
      }
      return this;
    };

    api.data = function (value) {
      if (!arguments.length) return data;
      data = value;
      if (sortCol) sort(sortCol);
      validate();
      update();
      return this;
    };

    api.columns = function (value) {
      if (!arguments.length) return columns;
      columns = convert(value);
      validate();
      update();
      return this;
    };

    api.on = function (type, listener) {
      dispatch.on(type, listener);
      return this;
    };

    api.update = function () {
      update();
      return this;
    };

    return api;
  };
});

//# sourceMappingURL=table.js.map