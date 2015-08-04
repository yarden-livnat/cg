define(["exports", "module", "d3"], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/4/15.
   */

  "use strict";

  module.exports = function (container, id) {
    var SORT_OP = [{ func: _d3.ascending, symbol: "fa-sort-asc" }, { func: _d3.descending, symbol: "fa-sort-desc" }];

    container = container instanceof Array && container || _d3.select(container);

    var table = container.append("table").attr("id", id),
        thead = table.append("thead").append("tr"),
        tbody = table.append("tbody"),
        dispatch = _d3.dispatch("click"),
        columns = undefined,
        sortCol = undefined;

    function capitalize(str) {
      var def = arguments[1] === undefined ? "" : arguments[1];

      return str && str.length > 0 && str[0].toUpperCase() + str.substr(1) || def;
    }

    function f(field) {
      return typeof field == "string" ? function (o) {
        return o[field];
      } : function (o) {
        return field;
      };
    }

    function onSort(col) {
      if (sortCol == this) {
        col.sortOrder = !col.sortOrder;
      } else if (sortCol) {
        _d3.select(sortCol).classed("asc desc", false);
      }

      _d3.select(this).classed({ asc: col.sortOrder, desc: !col.sortOrder });

      sortCol = this;

      var sortFunc = col.sortOrder && _d3.ascending || _d3.descending;
      tbody.selectAll("tr").sort(function (a, b) {
        return sortFunc(col.cellValue(a), col.cellValue(b));
      });
    }

    return {
      header: function header(columnsDef) {
        columnsDef = typeof columnsDef == "string" && columnsDef.split(",") || columnsDef;
        columns = columnsDef.map(function (col) {
          col = typeof col != "string" && col || { name: col };
          col.title = col.title || capitalize(col.name, "?");
          col.cellValue = col.cellValue || f(col.name);
          col.cellAttr = col.cellAttr || f({});
          col.attr = col.attr || "tableColHeader";
          col.sortOrder = col.sortOrder || 0;

          return col;
        });

        var h = thead.selectAll("th").data(columns);

        h.enter().append("th").attr("class", function (c) {
          return c.attr;
        }).on("click", onSort);

        h.text(function (c) {
          return c.title;
        });

        h.exit().remove();

        return this;
      },

      data: function data(list) {
        var rows = tbody.selectAll("tr").data(list, columns[0].cellValue);

        rows.enter().append("tr");
        rows.exit().remove();

        var cells = rows.selectAll("td").data(function (row) {
          return columns.map(function (c) {
            return { col: c, value: c.cellValue(row), attr: c.cellAttr(row), row: row };
          });
        });

        cells.enter().append("td").on("click", function (d) {
          dispatch.click(d);
        });

        cells.text(function (d) {
          return d.value;
        }).attr("class", function (d) {
          return d.col.attr;
        }).classed(function (d) {
          return d.attr;
        });

        cells.exit().remove();
        return this;
      },

      row: function row(filter) {
        return tbody.selectAll("tr").filter(filter);
      },

      cell: function cell(rfilter, cfilter) {
        return row(rfilter).filter(cfilter);
      }
    };
  };
});

//# sourceMappingURL=n-table.js.map