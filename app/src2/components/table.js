define(["exports", "module", "d3"], function (exports, module, _d3) {
  /**
   * Created by yarden on 8/4/15.
   */

  "use strict";

  module.exports = function (container, id) {
    var SORT_OP = [{ func: _d3.ascending, symbol: "fa-sort-asc" }, { func: _d3.descending, symbol: "fa-sort-desc" }];

    container = container instanceof Array && container || _d3.select(container);

    var table = container.append("table").attr("class", "info-table"),
        thead = table.append("thead").append("tr"),
        tbody = table.append("tbody"),
        dispatch = _d3.dispatch("click", "mouseover", "mouseout"),
        columns = undefined,
        sortCol = undefined,
        sortHeader = undefined,
        _data = undefined;

    if (id) {
      table.attr("id", id);
    }

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
      if (sortHeader == this) {
        col.sortOrder = !col.sortOrder;
      } else if (sortHeader) {
        _d3.select(sortHeader).classed("asc desc", false);
      }

      _d3.select(this).classed({ asc: col.sortOrder, desc: !col.sortOrder });

      sortHeader = this;
      sortCol = col;

      sortTable();
    }

    function sortTable() {
      if (!sortCol) return;
      var sortFunc = sortCol.sortOrder && _d3.ascending || _d3.descending;
      tbody.selectAll("tr").sort(function (a, b) {
        return sortFunc(sortCol.cellValue(a), sortCol.cellValue(b));
      });
    }

    return {
      id: function id(_) {
        table.attr("id", _);
      },

      header: function header(columnsDef) {
        columnsDef = typeof columnsDef == "string" && columnsDef.split(",") || columnsDef;
        columns = columnsDef.map(function (col) {
          col = typeof col == "string" && { name: col } || col;
          col.title = col.title || capitalize(col.name, "?");
          col.cellValue = col.cellValue || f(col.name);
          col.cellAttr = col.cellAttr || f({});
          col.attr = col.attr || "";
          col.sortOrder = col.sortOrder || 0;
          col.render = col.render || "text";

          return col;
        });

        var h = thead.selectAll("th").data(columns);

        h.enter().append("th").attr("class", "tableColHeader").on("click", onSort);

        h.text(function (c) {
          return c.title;
        });

        h.exit().remove();

        h.each(function (d) {
          d.minWidth = _d3.select(this).style("width");
        });

        return this;
      },

      data: function data(list) {
        if (!arguments.length) return _data;

        _data = list;
        var rows = tbody.selectAll("tr").data(list, columns[0].cellValue);

        rows.enter().append("tr");
        rows.exit().remove();

        var cells = rows.selectAll("td").data(function (row) {
          return columns.map(function (c) {
            return { col: c, value: c.cellValue(row), attr: c.cellAttr(row), row: row };
          });
        });

        cells.enter().append("td")
        //.attr('class', d => d.col.attr)
        .attr("width", function (d) {
          return d.col.minWidth;
        }).on("click", function (d) {
          dispatch.click.apply(this, arguments);
        }).on("mouseover", function (d) {
          dispatch.mouseover.apply(this, arguments);
        }).on("mouseout", function (d) {
          dispatch.mouseout.apply(this, arguments);
        });

        cells.filter(function (d) {
          return d.col.render == "text";
        }).text(function (d) {
          return d.value;
        })
        //.classed( d => d.attr );
        .classed({
          selected: function selected(d) {
            return d.row.classes && d.row.classes.selected;
          },
          excluded: function excluded(d) {
            return d.row.classes && d.row.classes.excluded;
          }
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function () {
            var col = _step.value;

            if (col.render != "text") {
              cells.filter(function (d) {
                return d.col == col;
              }).call(col.render);
            }
          };

          for (var _iterator = columns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        cells.exit().remove();

        sortTable();

        // adjust header cols width
        var i = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = tbody.select("tr").selectAll("td")[0][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var c = _step2.value;

            columns[i++].width = parseInt(_d3.select(c).style("width"));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (columns.length > 0) columns[columns.length - 1].width += 15;
        thead.selectAll("th").data(columns).attr("width", function (d) {
          return d.width;
        });

        return this;
      },

      row: function row(filter) {
        return tbody.selectAll("tr").filter(filter);
      },

      cell: function cell(rfilter, cfilter) {
        return row(rfilter).filter(cfilter);
      },

      on: function on(type, cb) {
        dispatch.on(type, cb);
        return this;
      }
    };
  };
});

//# sourceMappingURL=table.js.map