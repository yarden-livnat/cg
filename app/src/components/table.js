define(['exports', 'module', 'd3', '../utils'], function (exports, module, _d3, _utils) {
  /**
   * Created by yarden on 12/29/14.
   */

  'use strict';

  module.exports = function () {
    var SORT_OP = [{ func: _d3.ascending, symbol: 'fa-sort-asc' }, { func: _d3.descending, symbol: 'fa-sort-desc' }];

    var d3el = undefined,
        header = undefined,
        _data = undefined;
    var _width = undefined,
        _height = undefined;
    var valid = false;
    var _columns = [];
    var sortCol = undefined;
    var table = undefined,
        thead = undefined,
        tbody = undefined;
    var dispatch = _d3.dispatch('click');

    function identity() {
      return this;
    }

    function validate() {
      valid = d3el && _data; // && key; //&& width && height
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
      _data.sort(function (a, b) {
        return compare(a[field], b[field]);
      });

      _update();
    }

    function onSort(col) {
      if (sortCol && sortCol.name != col.name) showSort(sortCol.name, false);else col.sortOrder = 1 - col.sortOrder;
      sort(col);
    }

    function _update() {
      if (!valid) return;

      header = thead.selectAll('th').data(_columns);

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

      var rows = tbody.selectAll('tr').data(_data);

      rows.enter().append('tr').selectAll('td').data(_columns);

      rows.exit().remove();

      // update
      var cells = rows.selectAll('td').data(function (row) {
        return _columns.map(function (col) {
          return { col: col.name, value: col.value(row) /*[col.name]*/, klass: col['class'], row: row };
        });
      });

      cells.enter().append('td').on('click', function (d) {
        dispatch.click(d.row);
      });

      cells.text(function (d) {
        return d.value;
      }).attr('class', function (d) {
        return d.klass;
      });

      cells.exit().remove();
    }

    function convert(cols) {
      cols = typeof cols == 'string' ? cols.split(', ') : cols;
      return cols.map(function (col) {
        if (typeof col == 'string') col = { name: col };

        col.title = col.title || (0, _utils.capitalize)(col.name);
        col.sortOrder = col.sortOrder || 0;
        col.value = col.value || function (d) {
          return d[col.name];
        };
        col.attr = col.attr || function (d) {
          return d['attr'] && d['attr'][col.name];
        };
        return col;
      });
    }

    return {

      el: function el(_el) {
        if (!arguments.length) return d3el;
        d3el = typeof _el == 'string' ? _d3.select(_el) : _el;
        table = d3el;

        if (_width) table.attr('width', _width);
        if (_height) table.attr('height', _height);

        thead = table.append('thead').append('tr');
        tbody = table.append('tbody');

        validate();
        _update();
        return this;
      },

      width: function width(value) {
        if (!arguments.length) return _width;
        _width = value;
        if (table) {
          table.attr('width', _width);
        }
        return this;
      },

      height: function height(value) {
        if (!arguments.length) return _height;
        _height = value;
        if (table) {
          table.attr('height', _height);
        }
        return this;
      },

      data: function data(value) {
        if (!arguments.length) return _data;
        _data = value;
        if (sortCol) sort(sortCol);
        validate();
        _update();
        return this;
      },

      columns: function columns(value) {
        if (!arguments.length) return _columns;
        _columns = convert(value);
        validate();
        _update();
        return this;
      },

      on: function on(type, listener) {
        dispatch.on(type, listener);
        return this;
      },

      update: function update() {
        _update();
        return this;
      },

      row: function row(f) {
        return tbody.selectAll('tr').filter(f);
      }
    };
  };
});

//# sourceMappingURL=table.js.map